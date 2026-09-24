require "rails_helper"

RSpec.describe EmployeeOnboarder do
  def attrs(**overrides)
    {
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@acme.test",
      country: "GB",
      department: "engineering",
      employment_type: "full-time",
      started_on: "2024-01-01",
      compensation: {
        base_amount: 80_000,
        currency: "GBP",
        pay_period: "annual",
        effective_date: "2024-01-01",
        change_reason: "hire"
      }
    }.deep_merge(overrides)
  end

  it "creates an active employee and starting pay" do
    employee, record = described_class.call(attrs)

    expect(employee).to have_attributes(status: "active", email: "ada@acme.test")
    expect(record).to have_attributes(change_reason: "hire", currency: "GBP")
  end

  it "assigns a manager when manager_id is present" do
    manager = create(:employee, email: "mgr@acme.test")
    employee, = described_class.call(attrs.merge(manager_id: manager.id))

    expect(employee.manager_id).to eq(manager.id)
  end

  it "ignores an attempted leaver status on hire" do
    employee, = described_class.call(attrs.merge(status: "left", left_on: "2024-06-01"))

    expect(employee.status).to eq("active")
    expect(employee.left_on).to be_nil
  end

  it "defaults the first effective_date to started_on" do
    _employee, record = described_class.call(attrs(compensation: { effective_date: nil }))

    expect(record.effective_date).to eq(Date.new(2024, 1, 1))
  end

  it "requires starting compensation" do
    expect { described_class.call(attrs.except(:compensation)) }.to raise_error(
      described_class::Error, "compensation is required"
    )
  end

  it "rolls back the hire when pay is invalid" do
    expect {
      described_class.call(attrs(compensation: { currency: "JPY" }))
    }.to raise_error(ActiveRecord::RecordInvalid)

    expect(Employee.count).to eq(0)
  end

  it "treats an empty compensation object as missing" do
    expect { described_class.call(attrs.merge(compensation: {})) }.to raise_error(
      described_class::Error, "compensation is required"
    )
  end

  it "requires hours_per_week for hourly starting pay" do
    expect {
      described_class.call(attrs(compensation: { pay_period: "hourly", hours_per_week: nil }))
    }.to raise_error(ActiveRecord::RecordInvalid)
  end
end
