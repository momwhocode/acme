require "csv"
require "securerandom"

# Spreadsheet import. Validates against Employee / CompensationRecord, then insert_all.
class DirectoryImporter
  class Error < AppError; end
  MAX_BYTES = 5.megabytes

  BATCH_SIZE = 1_000
  EMPLOYEE_HEADERS = %w[
    first_name last_name email country department employment_type status
    level started_on left_on
  ].freeze
  COMP_HEADERS = %w[
    base_amount currency pay_period hours_per_week effective_date change_reason
  ].freeze
  REQUIRED_HEADERS = (EMPLOYEE_HEADERS + COMP_HEADERS).freeze

  def self.call(...)
    new(...).call
  end

  def initialize(path)
    @path = path.respond_to?(:path) ? path.path : path
  end

  def call
    raise Error, "file is required" if @path.blank?
    raise Error, "CSV not found: #{@path}" unless File.file?(@path)
    raise Error, "file is too large" if File.size(@path) > MAX_BYTES

    persist(parse)
  end

  private

  def parse
    table = CSV.read(@path, headers: true, header_converters: ->(header) { header.to_s.strip })
    raise Error, "CSV has no header row." if table.headers.blank?

    missing = REQUIRED_HEADERS - table.headers
    raise Error, "CSV is missing columns: #{missing.join(", ")}" if missing.any?

    grouped = Hash.new { |hash, key| hash[key] = [] }
    table.each_with_index do |row, index|
      email = row.fetch("email").to_s.strip.downcase
      raise Error, "Row #{index + 2} is missing email." if email.blank?

      grouped[email] << row
    end
    grouped
  rescue CSV::MalformedCSVError => error
    raise Error, "CSV is invalid: #{error.message}"
  end

  def persist(grouped)
    now = Time.current
    existing = Employee.where(email: grouped.keys).index_by(&:email)
    employees = []
    compensations = []
    updated = 0
    updated_comps = 0

    grouped.each do |email, rows|
      employee_attrs, compensation_attrs = records_from(rows, email, now)
      if (employee = existing[email])
        # Same email updates the hire — import is upsert, not skip-on-duplicate.
        updated += 1
        updated_comps += upsert_existing!(employee, employee_attrs, compensation_attrs)
        next
      end

      validate!(employee_attrs, compensation_attrs, email)
      employees << employee_attrs
      compensations.concat(compensation_attrs)
    end

    write!(employees, compensations)
    {
      employees: employees.size,
      updated: updated,
      compensation_records: compensations.size + updated_comps
    }
  end

  def upsert_existing!(employee, employee_attrs, compensation_attrs)
    employee.update!(employee_attrs.except(:id, :email, :created_at, :updated_at))
    compensation_attrs.count do |attrs|
      record = employee.compensation_records.find_or_initialize_by(effective_date: attrs[:effective_date])
      record.assign_attributes(attrs.except(:id, :employee_id, :created_at, :updated_at))
      record.save!
    end
  end

  def records_from(rows, email, now)
    employee_attrs = employee_from(rows.first, email, now)
    compensation_attrs = rows.map { |row| compensation_from(row, employee_attrs, now, email) }
    dates = compensation_attrs.map { |row| row[:effective_date] }
    if dates.uniq.size != dates.size
      raise Error, "#{email} has duplicate effective_date rows."
    end

    [ employee_attrs, compensation_attrs ]
  end

  def validate!(employee_attrs, compensation_attrs, email)
    employee = Employee.new(employee_attrs.except(:id, :created_at, :updated_at))
    compensation_attrs.each do |attrs|
      employee.compensation_records.build(attrs.except(:id, :employee_id, :created_at, :updated_at))
    end

    messages = []
    messages.concat(employee.errors.full_messages) unless employee.valid?
    employee.compensation_records.each do |record|
      messages.concat(record.errors.full_messages) unless record.valid?
    end
    raise Error, "#{email}: #{messages.uniq.join(", ")}" if messages.any?
  end

  def write!(employees, compensations)
    ActiveRecord::Base.transaction do
      employees.each_slice(BATCH_SIZE) { |batch| Employee.insert_all!(batch) }
      compensations.each_slice(BATCH_SIZE) { |batch| CompensationRecord.insert_all!(batch) }
    end
  end

  def employee_from(row, email, now)
    {
      id: SecureRandom.uuid,
      first_name: row.fetch("first_name").to_s.strip.presence,
      last_name: row.fetch("last_name").to_s.strip.presence,
      email: email,
      country: row.fetch("country").to_s.strip.upcase.presence,
      department: row.fetch("department").to_s.strip.gsub(/\s+/, " ").downcase.presence,
      employment_type: row.fetch("employment_type").to_s.strip.downcase.presence,
      status: row.fetch("status").to_s.strip.downcase.presence,
      level: row["level"].to_s.strip.presence,
      started_on: parse_date(row.fetch("started_on"), "started_on", email),
      left_on: parse_optional_date(row["left_on"], "left_on", email),
      created_at: now,
      updated_at: now
    }
  end

  def compensation_from(row, employee, now, email)
    {
      id: SecureRandom.uuid,
      employee_id: employee[:id],
      base_amount: row.fetch("base_amount"),
      currency: row.fetch("currency").to_s.strip.upcase.presence,
      pay_period: row.fetch("pay_period").to_s.strip.downcase.presence,
      hours_per_week: row["hours_per_week"].to_s.strip.presence,
      effective_date: parse_date(row.fetch("effective_date"), "effective_date", email),
      change_reason: row["change_reason"].to_s.strip.presence,
      created_at: now,
      updated_at: now
    }
  end

  def parse_date(value, field, context)
    text = value.to_s.strip
    raise Error, "#{context}: #{field} is required." if text.blank?

    Date.iso8601(text)
  rescue Date::Error, ArgumentError
    raise Error, "#{context}: #{field} must be an ISO8601 date."
  end

  def parse_optional_date(value, field, context)
    text = value.to_s.strip
    return if text.blank?

    parse_date(text, field, context)
  end
end
