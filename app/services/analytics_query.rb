class AnalyticsQuery
  def self.call(...)
    new(...).call
  end

  def initialize(as_of: Date.current)
    @as_of = as_of.to_date
  end

  def call
    rows = query(mix_sql, @as_of, @as_of, @as_of, @as_of, @as_of, name: "AnalyticsMix")
    total = rows.find { |row| row["bucket"] == "total" } || {}

    {
      headcount: total["headcount"].to_i,
      annualised_usd: money(total["payroll_usd"]) || 0,
      average_usd: money(total["average_usd"]),
      median_usd: money(total["median_usd"]),
      monthly_usd: monthly_usd,
      by_type: mix_rows(rows, "type", :employment_type),
      by_department: mix_rows(rows, "department", :department),
      by_country: mix_rows(rows, "country", :country),
      by_currency: mix_rows(rows, "currency", :currency, local: true),
      fx_rates: fx_rates
    }
  end

  private

  def monthly_usd
    month_start = @as_of.beginning_of_month
    month_end = @as_of.end_of_month
    row = query(monthly_sql, @as_of, @as_of, @as_of, month_end, month_start, name: "AnalyticsMonthly").first || {}
    money(row["monthly_usd"]) || 0
  end

  def current_comp_sql
    <<~SQL.squish
      SELECT DISTINCT ON (employees.id)
        employees.status,
        employees.employment_type,
        employees.department,
        employees.country,
        employees.started_on,
        employees.left_on,
        compensation_records.base_amount,
        compensation_records.currency,
        compensation_records.pay_period,
        compensation_records.hours_per_week
      FROM employees
      LEFT JOIN compensation_records
        ON compensation_records.employee_id = employees.id
        AND compensation_records.effective_date <= LEAST(COALESCE(employees.left_on, ?::date), ?::date)
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
        current_comp.status,
        current_comp.employment_type,
        current_comp.department,
        current_comp.country,
        current_comp.currency,
        current_comp.started_on,
        current_comp.left_on,
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

  def mix_sql
    <<~SQL.squish
      WITH current_comp AS (#{current_comp_sql}),
      valued AS (#{valued_sql})
      SELECT
        CASE
          WHEN GROUPING(employment_type) = 0 THEN 'type'
          WHEN GROUPING(department) = 0 THEN 'department'
          WHEN GROUPING(country) = 0 THEN 'country'
          WHEN GROUPING(currency) = 0 THEN 'currency'
          ELSE 'total'
        END AS bucket,
        employment_type,
        department,
        country,
        currency,
        COUNT(*)::bigint AS headcount,
        COALESCE(ROUND(SUM(annualised_usd), 2), 0) AS payroll_usd,
        COALESCE(ROUND(SUM(payroll_local), 2), 0) AS payroll_local,
        ROUND(AVG(annualised_usd), 2) AS average_usd,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annualised_usd))::numeric, 2) AS median_usd
      FROM valued
      WHERE started_on <= ?::date
        AND (left_on IS NULL OR left_on >= ?::date)
      GROUP BY GROUPING SETS ((employment_type), (department), (country), (currency), ())
    SQL
  end

  def monthly_sql
    <<~SQL.squish
      WITH current_comp AS (#{current_comp_sql}),
      valued AS (#{valued_sql})
      SELECT COALESCE(ROUND(SUM(annualised_usd) / 12, 2), 0) AS monthly_usd
      FROM valued
      WHERE started_on <= ?::date
        AND (left_on IS NULL OR left_on >= ?::date)
    SQL
  end

  def mix_rows(rows, bucket, key, local: false)
    rows.select { |row| row["bucket"] == bucket }
        .sort_by { |row| row[key.to_s].to_s }
        .map do |row|
          item = {
            key => row[key.to_s],
            headcount: row["headcount"].to_i,
            payroll_usd: money(row["payroll_usd"]) || 0
          }
          item[:payroll_local] = money(row["payroll_local"]) || 0 if local
          item
        end
  end

  def query(sql, *binds, name:)
    ApplicationRecord.connection.select_all(ApplicationRecord.sanitize_sql_array([ sql, *binds ]), name)
  end

  def fx_rates
    ExchangeRate.supported_currencies.filter_map do |code|
      rate = ExchangeRate.rate_to(from: code, to: CurrencyNormalizer::BASE_CURRENCY, on: @as_of)
      next if rate.blank?

      { currency: code, to_usd: BigDecimal(rate.to_s) }
    end
  end

  def money(value)
    return if value.nil?

    BigDecimal(value.to_s)
  end
end
