# Hard-delete a mistaken hire. Compensation rows go with `dependent: :destroy`.

class EmployeeDestroyer
  def self.call(employee:)
    employee.destroy!
  end
end
