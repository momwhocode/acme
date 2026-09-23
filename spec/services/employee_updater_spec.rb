require "rails_helper"

RSpec.describe EmployeeUpdater do
  def update(employee, **params)
    described_class.call(employee: employee, params: params)
  end

  it "updates identity fields and ignores status" do
    employee = create(:employee, first_name: "Ada", status: "active")

    updated = update(employee, first_name: "Grace", department: "sales", status: "left")

    expect(updated).to have_attributes(first_name: "Grace", department: "sales", status: "active")
  end

  it "clears an optional level" do
    employee = create(:employee, level: "IC2")

    expect(update(employee, level: "").level).to be_nil
  end

  it "rejects an empty update" do
    expect { update(create(:employee), left_on: "2025-06-01") }.to raise_error(
      described_class::Error, "no employee fields to update"
    )
  end

  it "rejects a start date after the earliest compensation" do
    employee = create(:employee, started_on: Date.new(2024, 1, 1))
    create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1))

    expect { update(employee, started_on: "2024-06-01") }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "updates a leaver without changing leave status" do
    employee = create(:employee, :left, email: "ada@acme.test")

    updated = update(employee, email: "grace@acme.test")

    expect(updated).to have_attributes(email: "grace@acme.test", status: "left")
  end
end
