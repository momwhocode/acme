require "rails_helper"

RSpec.describe EmployeeDestroyer do
  it "deletes the hire and compensation rows" do
    employee = create(:employee)
    create(:compensation_record, employee: employee)

    described_class.call(employee: employee)

    expect(Employee.find_by(id: employee.id)).to be_nil
    expect(CompensationRecord.where(employee_id: employee.id)).to be_empty
  end

  it "nullifies direct reports instead of deleting them" do
    manager = create(:employee, first_name: "Priya", email: "priya@acme.test")
    report = create(:employee, manager: manager)

    described_class.call(employee: manager)

    expect(report.reload.manager_id).to be_nil
  end
end
