# Append a new effective-dated pay row. Optional level writes through to the employee.

class CompensationAppender
  class Error < AppError; end

  def self.call(...)
    new(...).call
  end

  def initialize(employee:, params:)
    @employee = employee
    @params = params.to_h.with_indifferent_access
  end

  def call
    raise Error, "cannot change pay for a leaver" if @employee.status == "left"

    Employee.transaction do
      record = @employee.compensation_records.create!(compensation_attrs)
      # Level is an employee field; pay change forms send it on the same request.
      @employee.update!(level: @params[:level]) if @params.key?(:level)
      [ record, @employee.reload ]
    end
  end

  private

  def compensation_attrs
    @params.slice(*CompensationRecord::ATTR_KEYS)
  end
end
