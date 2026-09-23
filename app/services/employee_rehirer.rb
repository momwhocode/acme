# Reactivate a leaver. started_on stays put so historical pay dates remain valid.

class EmployeeRehirer
  class Error < AppError; end

  def self.call(employee:)
    raise Error.t(:already_active) if employee.status == "active"

    employee.update!(status: "active", left_on: nil)
    employee
  end
end
