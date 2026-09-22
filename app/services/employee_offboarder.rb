class EmployeeOffboarder
  class Error < StandardError; end

  def self.call(employee:, left_on:)
    raise Error, "already left" if employee.status == "left"
    raise Error, "left_on is required" if left_on.blank?

    employee.update!(status: "left", left_on: parse_date(left_on))
    employee
  end

  def self.parse_date(value)
    return value if value.is_a?(Date)

    Date.iso8601(value.to_s)
  rescue Date::Error
    raise Error, "left_on is invalid"
  end
  private_class_method :parse_date
end
