class EmployeeProfile
  def self.call(employee, normalizer: CurrencyNormalizer.new)
    records = employee.compensation_records.order(effective_date: :desc, id: :desc).to_a
    current = employee.current_compensation_record

    {
      employee: employee.as_directory_json,
      current_compensation: CompensationPayload.call(current, normalizer: normalizer),
      compensation_records: records.map { |record| CompensationPayload.call(record, normalizer: normalizer) }
    }
  end
end
