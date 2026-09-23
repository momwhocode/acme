class DirectoryPayload
  def self.employees(records, normalizer: CurrencyNormalizer.new)
    list = Array(records)
    ActiveRecord::Associations::Preloader.new(records: list, associations: :manager).call if list.any?
    current = current_by_employee_id(list)
    list.map do |employee|
      employee.as_directory_json.merge(
        current_compensation: CompensationPayload.call(current[employee.id], normalizer: normalizer)
      )
    end
  end

  def self.facets
    {
      departments: Employee.distinct.order(:department).pluck(:department),
      countries: Employee.distinct.order(:country).pluck(:country),
      managers: Employee.where(id: Employee.where.not(manager_id: nil).select(:manager_id))
                        .order(:last_name, :first_name)
                        .map { |manager| { id: manager.id, name: manager.display_name } }
    }
  end

  def self.current_by_employee_id(employees)
    ids = employees.map(&:id)
    return {} if ids.empty?

    grouped = CompensationRecord.where(employee_id: ids)
                                .order(:employee_id, effective_date: :desc, id: :desc)
                                .group_by(&:employee_id)

    employees.each_with_object({}) do |employee, map|
      cutoff = [ employee.left_on, Date.current ].compact.min
      map[employee.id] = grouped[employee.id]&.find { |record| record.effective_date <= cutoff }
    end
  end
  private_class_method :current_by_employee_id
end
