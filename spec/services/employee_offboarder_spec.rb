require "rails_helper"

RSpec.describe EmployeeOffboarder do
  it "marks the employee as left" do
    employee = create(:employee)
    create(:compensation_record, employee: employee)

    described_class.call(employee: employee, left_on: "2025-06-01")

    expect(employee).to have_attributes(status: "left", left_on: Date.new(2025, 6, 1))
  end

  it "rejects a second offboard" do
    employee = create(:employee, :left)

    expect { described_class.call(employee: employee, left_on: "2025-07-01") }.to raise_error(
      described_class::Error, "already left"
    )
  end

  it "requires left_on" do
    expect { described_class.call(employee: create(:employee), left_on: nil) }.to raise_error(
      described_class::Error, "left_on is required"
    )
  end

  it "rejects a leave date before the latest compensation" do
    employee = create(:employee)
    create(:compensation_record, employee: employee, effective_date: Date.new(2025, 4, 1))

    expect {
      described_class.call(employee: employee, left_on: "2025-03-01")
    }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "rejects a leave date before started_on" do
    employee = create(:employee, started_on: Date.new(2024, 1, 1))

    expect {
      described_class.call(employee: employee, left_on: "2023-12-01")
    }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "rejects a non-ISO leave date" do
    expect { described_class.call(employee: create(:employee), left_on: "June 1") }.to raise_error(
      described_class::Error, "left_on is invalid"
    )
  end
end
