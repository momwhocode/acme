require "rails_helper"

RSpec.describe EmployeeRehirer do
  it "reactivates a leaver without moving started_on" do
    employee = create(:employee, :left, started_on: Date.new(2024, 1, 1))

    rehired = described_class.call(employee: employee)

    expect(rehired).to have_attributes(status: "active", left_on: nil, started_on: Date.new(2024, 1, 1))
  end

  it "rejects an active employee" do
    expect {
      described_class.call(employee: create(:employee))
    }.to raise_error(described_class::Error, "already active")
  end
end
