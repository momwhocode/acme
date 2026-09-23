class EmployeeUpdater
  class Error < AppError; end

  ATTR_KEYS = %i[
    first_name last_name email country department employment_type level started_on
  ].freeze

  def self.call(...)
    new(...).call
  end

  def initialize(employee:, params:)
    @employee = employee
    @params = params.to_h.with_indifferent_access
  end

  def call
    attrs = @params.slice(*ATTR_KEYS)
    raise Error, "no employee fields to update" if attrs.empty?

    @employee.update!(attrs)
    @employee
  end
end
