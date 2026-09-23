# Home as_of snapshot. Mix filters apply after the two compensation JOIN dates.

class AnalyticsQuery
  def self.call(...)
    new(...).call
  end

  def initialize(as_of: Date.current, country: nil, department: nil, type: nil, level: nil)
    @as_of = as_of.to_date
    @countries = list_values(country).map(&:upcase)
    @departments = list_values(department).map { |value| value.gsub(/\s+/, " ").downcase }
    @types = list_values(type)
    @levels = Employee.levels_in_bucket(list_values(level))
  end

  def call
    predicate, filter_binds = employee_predicate
    # JOIN dates, then mix filters, then valued FX + employment window. Do not prepend filters.
    rows = query(mix_sql(predicate), @as_of, @as_of, *filter_binds, @as_of, @as_of, @as_of, name: "AnalyticsMix")
    total = rows.find { |row| row["bucket"] == "total" } || {}

    {
      headcount: total["headcount"].to_i,
      annualised_usd: money(total["payroll_usd"]) || 0,
      median_usd: money(total["median_usd"]),
      by_type: mix_rows(rows, "type", :employment_type),
      by_department: mix_rows(rows, "department", :department),
      by_country: mix_rows(rows, "country", :country),
      by_level: mix_rows(rows, "level", :level),
      actions: actions
    }
  end

  private

  # Latest pay row on or before min(left_on, as_of). Headcount is employment dates, not status=active.
  def current_comp_sql(predicate)
    <<~SQL.squish
      SELECT DISTINCT ON (employees.id)
        employees.employment_type,
        employees.department,
        employees.country,
        employees.started_on,
        employees.left_on,
        employees.level,
        compensation_records.base_amount,
        compensation_records.currency,
        compensation_records.pay_period,
        compensation_records.hours_per_week
      FROM employees
      LEFT JOIN compensation_records
        ON compensation_records.employee_id = employees.id
        AND compensation_records.effective_date <= LEAST(COALESCE(employees.left_on, ?::date), ?::date)
      WHERE #{predicate}
      ORDER BY employees.id, compensation_records.effective_date DESC, compensation_records.id DESC
    SQL
  end

  def valued_sql
    weeks = CurrencyNormalizer::WEEKS_PER_YEAR
    months = CurrencyNormalizer::MONTHS_PER_YEAR
    days = CurrencyNormalizer::WORKING_DAYS_PER_YEAR
    usd = CurrencyNormalizer::BASE_CURRENCY

    <<~SQL.squish
      SELECT
        current_comp.employment_type,
        current_comp.department,
        current_comp.country,
        current_comp.currency,
        current_comp.started_on,
        current_comp.left_on,
        current_comp.level,
        pay.payroll_local,
        (pay.payroll_local * fx.rate)::numeric AS annualised_usd
      FROM current_comp
      CROSS JOIN LATERAL (
        SELECT (
          CASE current_comp.pay_period
            WHEN 'annual' THEN current_comp.base_amount
            WHEN 'monthly' THEN current_comp.base_amount * #{months}
            WHEN 'daily' THEN current_comp.base_amount * #{days}
            WHEN 'hourly' THEN current_comp.base_amount * current_comp.hours_per_week * #{weeks}
          END
        )::numeric AS payroll_local
      ) pay
      LEFT JOIN LATERAL (
        SELECT exchange_rates.rate
        FROM exchange_rates
        WHERE exchange_rates.from_currency = current_comp.currency
          AND exchange_rates.to_currency = '#{usd}'
          AND exchange_rates.effective_date <= ?::date
        ORDER BY exchange_rates.effective_date DESC
        LIMIT 1
      ) fx ON TRUE
    SQL
  end

  # Currency is only set when the grouping is a single currency (GROUPING SETS cannot SELECT currency).
  def mix_sql(predicate)
    <<~SQL.squish
      WITH current_comp AS (#{current_comp_sql(predicate)}),
      valued AS (#{valued_sql})
      SELECT
        CASE
          WHEN GROUPING(employment_type) = 0 THEN 'type'
          WHEN GROUPING(department) = 0 THEN 'department'
          WHEN GROUPING(country) = 0 THEN 'country'
          WHEN GROUPING(level) = 0 THEN 'level'
          ELSE 'total'
        END AS bucket,
        employment_type,
        department,
        country,
        level,
        CASE WHEN COUNT(DISTINCT currency) = 1 THEN MIN(currency) END AS currency,
        COUNT(*)::bigint AS headcount,
        COALESCE(ROUND(SUM(annualised_usd), 2), 0) AS payroll_usd,
        COALESCE(ROUND(SUM(payroll_local), 2), 0) AS payroll_local,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annualised_usd))::numeric, 2) AS median_usd
      FROM valued
      WHERE started_on <= ?::date
        AND (left_on IS NULL OR left_on >= ?::date)
      GROUP BY GROUPING SETS ((employment_type), (department), (country), (level), ())
    SQL
  end

  def mix_rows(rows, bucket, key)
    rows.select { |row| row["bucket"] == bucket }
        .sort_by { |row| row[key.to_s].to_s }
        .map do |row|
          item = {
            key => row[key.to_s],
            headcount: row["headcount"].to_i,
            payroll_usd: money(row["payroll_usd"]) || 0,
            payroll_local: money(row["payroll_local"]) || 0,
            median_usd: money(row["median_usd"])
          }
          currency = row["currency"].presence
          item[:currency] = currency if currency
          item
        end
  end

  def query(sql, *binds, name:)
    ApplicationRecord.connection.select_all(ApplicationRecord.sanitize_sql_array([ sql, *binds ]), name)
  end

  # Trailing 30 days for onboard/leave/pay; contracts look 90 days past as_of.
  def actions
    window = (@as_of - 29.days)..@as_of
    upcoming = (@as_of + 1.day)..(@as_of + 90.days)
    people = filtered_employees

    {
      onboarding: action_group(people.where(started_on: window).order(started_on: :desc), :started_on),
      offboarding: action_group(people.where(left_on: window).order(left_on: :desc), :left_on),
      contracts: action_group(
        people.where(employment_type: %w[contractor freelancer intern], status: "active")
              .where(left_on: upcoming)
              .order(:left_on),
        :left_on
      ),
      recent: recent_changes(window, people)
    }
  end

  def action_group(scope, date_key)
    {
      count: scope.unscope(:order).count,
      employees: scope.limit(7).map { |employee| action_employee(employee, employee.public_send(date_key)) }
    }
  end

  def recent_changes(window, people)
    records = CompensationRecord.includes(:employee).where(employee_id: people.select(:id))
                                .where(effective_date: window).order(effective_date: :desc, id: :desc)
    {
      count: records.unscope(:order).count,
      employees: records.limit(7).map do |record|
        action_employee(record.employee, record.effective_date)
      end
    }
  end

  def action_employee(employee, event_on)
    employee.as_directory_json.merge(
      event_on: event_on,
      missing_comp: employee.current_compensation_record(as_of: @as_of).blank?
    )
  end

  def money(value)
    return if value.nil?

    BigDecimal(value.to_s)
  end

  def filtered_employees
    scope = Employee.all
    scope = scope.where(country: @countries) if @countries.any?
    scope = scope.where(department: @departments) if @departments.any?
    scope = scope.where(employment_type: @types) if @types.any?
    scope = scope.where(level: @levels) if @levels.any?
    scope
  end

  # Optional mix filters. Binds follow the two JOIN date placeholders in mix_sql.
  def employee_predicate
    clauses = [ "TRUE" ]
    binds = []
    if @countries.any?
      clauses << "employees.country IN (#{placeholders(@countries)})"
      binds.concat(@countries)
    end
    if @departments.any?
      clauses << "employees.department IN (#{placeholders(@departments)})"
      binds.concat(@departments)
    end
    if @types.any?
      clauses << "employees.employment_type IN (#{placeholders(@types)})"
      binds.concat(@types)
    end
    if @levels.any?
      clauses << "employees.level IN (#{placeholders(@levels)})"
      binds.concat(@levels)
    end
    [ clauses.join(" AND "), binds ]
  end

  def placeholders(values)
    values.map { "?" }.join(", ")
  end

  def list_values(value)
    Array(value).flat_map { |entry| entry.to_s.split(",") }.map(&:strip).reject(&:blank?)
  end
end
