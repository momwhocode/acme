# Create an active hire and the first compensation row in one transaction.

class EmployeeOnboarder
  class Error < AppError; end

  EMPLOYEE_KEYS = %i[
    first_name last_name email country department employment_type level started_on
  ].freeze

  def self.call(...)
    new(...).call
  end

  def initialize(params)
    @params = params.to_h.with_indifferent_access
  end

  def call
    Employee.transaction do
      employee = Employee.create!(employee_attrs)
      record = employee.compensation_records.create!(compensation_attrs)
      [ employee, record ]
    end
  end

  private

  def employee_attrs
    @params.slice(*EMPLOYEE_KEYS).merge(status: "active", left_on: nil)
  end

  def compensation_attrs
    raw = @params[:compensation]
    raise Error, "compensation is required" if raw.blank?

    attrs = raw.to_h.with_indifferent_access.slice(*CompensationRecord::ATTR_KEYS)
    attrs[:effective_date] = @params[:started_on] if attrs[:effective_date].blank?
    attrs
  end
end
