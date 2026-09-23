class EmployeeRehirer
  class Error < AppError; end

  def self.call(employee:)
    raise Error, "already active" if employee.status == "active"

    employee.update!(status: "active", left_on: nil)
    employee
  end
end
