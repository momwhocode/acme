# Profile modal payload: current pay, history, and recent audit events.

class EmployeeProfile
  def self.call(employee, normalizer: CurrencyNormalizer.new)
    records = employee.compensation_records.order(effective_date: :desc, id: :desc).to_a
    current = employee.current_compensation_record

    current_payload = CompensationPayload.call(current, normalizer: normalizer)
    {
      employee: employee.as_directory_json,
      current_compensation: current_payload,
      compensation_records: records.map { |record| CompensationPayload.call(record, normalizer: normalizer) },
      audit_events: AuditEvent.for_employee(employee).limit(20).includes(:actor).map(&:as_api_json)
    }
  end
end
