class EmployeeDestroyer
  def self.call(employee:)
    Employee.transaction do
      employee.compensation_records.delete_all
      employee.destroy!
    end
  end
end
