class DirectoryQuery
  class Error < StandardError; end

  DEFAULT_LIMIT = 25
  MAX_LIMIT = 100
  SEARCH_SQL = "(first_name || ' ' || last_name || ' ' || email) ILIKE :q"

  def initialize(params)
    @params = params
  end

  def relation
    scope = Employee.all
    scope = apply_equals(scope, :country, normalize_country)
    scope = apply_equals(scope, :department, normalize_department)
    scope = apply_equals(scope, :employment_type, normalize_type)
    scope = apply_equals(scope, :status, normalize_status)
    apply_search(scope).order(:last_name, :first_name, :id)
  end

  def page
    raw = integer_param(:page) || 1
    raw.positive? ? raw : 1
  end

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

    scope.where(SEARCH_SQL, q: "%#{Employee.sanitize_sql_like(term)}%")
  end

  def normalize_country
    value = @params[:country].to_s.strip.upcase.presence
    return if value.blank?
    raise Error, "unknown country" unless value.match?(/\A[A-Z]{2}\z/)

    value
  end

  def normalize_department
    @params[:department].to_s.strip.gsub(/\s+/, " ").downcase.presence
  end

  def normalize_type
    permitted(@params[:type].presence || @params[:employment_type], Employee::EMPLOYMENT_TYPES, "unknown type")
  end

  def normalize_status
    permitted(@params[:status], Employee::STATUSES, "unknown status")
  end

  def permitted(raw, allowed, error)
    value = raw.to_s.strip.downcase.presence
    return if value.blank?
    raise Error, error unless allowed.include?(value)

    value
  end

  def integer_param(key)
    raw = @params[key]
    return if raw.blank?

    Integer(raw, exception: false)
  end
end
