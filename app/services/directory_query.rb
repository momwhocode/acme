# Paginated Employees listing. Filters, search, and sort stay in SQL.

class DirectoryQuery
  class Error < AppError; end

  DEFAULT_LIMIT = 25
  MAX_LIMIT = 100
  MAX_QUERY = 255
  SEARCH_SQL = "(first_name || ' ' || last_name || ' ' || email) ILIKE :q"
  SORT_COLUMNS = {
    "lead" => %i[last_name first_name id],
    "email" => %i[email id],
    "department" => %i[department last_name id],
    "country" => %i[country last_name id],
    "employment_type" => %i[employment_type last_name id],
    "status" => %i[status last_name id],
    "level" => %i[level last_name id],
    "started_on" => %i[started_on last_name id]
  }.freeze

  def initialize(params)
    @params = params
  end

  def relation
    scope = Employee.all
    scope = apply_equals(scope, :country, normalize_country)
    scope = apply_equals(scope, :department, normalize_department)
    scope = apply_equals(scope, :employment_type, normalize_type)
    scope = apply_equals(scope, :status, normalize_status)
    scope = apply_equals(scope, :level, normalize_level)
    scope = apply_manager(scope)
    apply_sort(apply_search(scope))
  end

  def page
    raw = integer_param(:page) || 1
    raw.positive? ? raw : 1
  end

  # OpenAPI uses per_page; limit is the older alias.
  def limit
    raw = integer_param(:per_page) || integer_param(:limit) || DEFAULT_LIMIT
    raw.clamp(1, MAX_LIMIT)
  end

  private

  def apply_equals(scope, column, value)
    value.present? ? scope.where(column => value) : scope
  end

  def apply_search(scope)
    term = @params[:q].to_s.strip
    return scope if term.blank?
    raise Error.t(:q_too_long) if term.length > MAX_QUERY

    scope.where(SEARCH_SQL, q: "%#{Employee.sanitize_sql_like(term)}%")
  end

  def normalize_country
    values = list_param(:country).map(&:upcase)
    return if values.empty?

    values.each { |value| raise Error.t(:unknown_country) unless value.match?(/\A[A-Z]{2}\z/) }
    values.uniq
  end

  def normalize_department
    values = list_param(:department).map { |value| value.gsub(/\s+/, " ").downcase }
    values.presence
  end

  # Home and OpenAPI send `type`; some clients still send employment_type.
  def normalize_type
    permitted(list_param(:type, :employment_type), Employee::EMPLOYMENT_TYPES, :unknown_type)
  end

  def normalize_status
    permitted(list_param(:status), Employee::STATUSES, :unknown_status)
  end

  def normalize_level
    values = Employee.levels_in_bucket(list_param(:level))
    values.presence
  end

  def permitted(raw, allowed, error)
    values = Array(raw).map { |value| value.to_s.strip.downcase }.reject(&:blank?)
    return if values.empty?

    values.each { |value| raise Error.t(error) unless allowed.include?(value) }
    values.uniq
  end

  def list_param(*keys)
    keys.flat_map { |key| Array(@params[key]) }
        .flat_map { |value| value.to_s.split(",") }
        .map(&:strip)
        .reject(&:blank?)
  end

  def apply_manager(scope)
    ids = list_param(:manager)
    return scope if ids.empty?

    ids.each { |id| raise Error.t(:unknown_manager) unless id.match?(/\A[0-9a-f-]{36}\z/i) }
    scope.where(manager_id: ids)
  end

  def apply_sort(scope)
    key = @params[:sort].to_s
    # Default directory order is A–Z by last name — not whatever the last explicit sort was.
    return scope.order(last_name: :asc, first_name: :asc, id: :asc) if key.blank?

    direction = @params[:direction].to_s == "asc" ? :asc : :desc
    return apply_pay_sort(scope, direction) if key == "pay"

    columns = SORT_COLUMNS[key] || %i[last_name first_name id]
    order = columns.index_with { |column| column == :id ? :asc : direction }
    scope.order(order)
  end

  def apply_pay_sort(scope, direction)
    quoted = direction == :asc ? "ASC" : "DESC"
    scope.joins(<<~SQL.squish)
      LEFT JOIN LATERAL (
        SELECT compensation_records.base_amount
        FROM compensation_records
        WHERE compensation_records.employee_id = employees.id
          AND compensation_records.effective_date <= LEAST(COALESCE(employees.left_on, CURRENT_DATE), CURRENT_DATE)
        ORDER BY compensation_records.effective_date DESC, compensation_records.id DESC
        LIMIT 1
      ) current_pay ON TRUE
    SQL
      .order(Arel.sql("current_pay.base_amount #{quoted} NULLS LAST, employees.last_name ASC"))
  end

  def integer_param(key)
    raw = @params[key]
    return if raw.blank?

    Integer(raw, exception: false)
  end
end
