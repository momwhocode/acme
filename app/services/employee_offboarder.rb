# Mark a leaver. left_on must cover every compensation effective date.

class EmployeeOffboarder
  class Error < AppError; end

  def self.call(employee:, left_on:)
    raise Error.t(:already_left) if employee.status == "left"
    raise Error.t(:left_on_required) if left_on.blank?

    employee.update!(status: "left", left_on: parse_date(left_on))
    employee
  end

  def self.parse_date(value)
    return value if value.is_a?(Date)

    Date.iso8601(value.to_s)
  rescue Date::Error
    raise Error.t(:left_on_invalid)
  end
  private_class_method :parse_date
end
