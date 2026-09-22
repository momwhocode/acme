require "rails_helper"

RSpec.describe CompensationAppender do
  def append(employee, **params)
    described_class.call(
      employee: employee,
      params: {
        base_amount: 90_000,
        currency: "GBP",
        pay_period: "annual",
        effective_date: "2025-04-01",
        change_reason: "promotion"
      }.merge(params)
    )
  end

  it "appends an effective-dated pay change" do
    employee = create(:employee)
    create(:compensation_record, employee: employee)

    record, = append(employee)

    expect(record).to have_attributes(change_reason: "promotion", base_amount: 90_000)
    expect(employee.compensation_records.count).to eq(2)
  end

  it "updates level when a promotion includes one" do
    employee = create(:employee, level: "IC2")
    create(:compensation_record, employee: employee)

    _record, updated = append(employee, level: "IC3")

    expect(updated.level).to eq("IC3")
  end

  it "rejects a second record on the same date" do
    employee = create(:employee)
    create(:compensation_record, employee: employee, effective_date: Date.new(2025, 4, 1))

    expect { append(employee) }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "rejects a pay change for a leaver" do
    employee = create(:employee, :left)

    expect { append(employee) }.to raise_error(described_class::Error, "cannot change pay for a leaver")
  end

  it "rejects an effective_date before the employee started" do
    employee = create(:employee, started_on: Date.new(2024, 6, 1))
    create(:compensation_record, employee: employee, effective_date: Date.new(2024, 6, 1))

    expect { append(employee, effective_date: "2024-01-01") }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "does not change level when the field is omitted" do
    employee = create(:employee, level: "IC2")
    create(:compensation_record, employee: employee)

    _record, updated = append(employee)

    expect(updated.level).to eq("IC2")
  end
end
