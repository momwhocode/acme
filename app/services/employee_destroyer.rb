# Hard-delete a mistaken hire. Pay rows cascade; reports lose manager_id.

class EmployeeDestroyer
  def self.call(employee:)
    employee.destroy!
  end
end
