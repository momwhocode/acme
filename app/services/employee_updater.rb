# Identity edit. Status and leave date stay on offboard / rehire.

class EmployeeUpdater
  class Error < AppError; end

  ATTR_KEYS = %i[
    first_name last_name email country department employment_type level started_on manager_id
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
    attrs[:manager_id] = attrs[:manager_id].presence if attrs.key?(:manager_id)

    @employee.update!(attrs)
    @employee
  end
end
