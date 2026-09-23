require "rails_helper"

RSpec.describe CompensationCorrector do
  it "updates pay fields on an existing row" do
    record = create(:compensation_record, base_amount: 80_000, currency: "USD")

    updated = described_class.call(
      record: record,
      params: { base_amount: 81_000, currency: "GBP", pay_period: "annual", change_reason: "correction" }
    )

    expect(updated).to have_attributes(base_amount: 81_000, currency: "GBP", change_reason: "correction")
  end

  it "rejects an empty update" do
    record = create(:compensation_record)

    expect {
      described_class.call(record: record, params: { level: "IC3" })
    }.to raise_error(described_class::Error, "no compensation fields to update")
  end

  it "rejects a date before the employee started" do
    employee = create(:employee, started_on: Date.new(2024, 6, 1))
    record = create(:compensation_record, employee: employee, effective_date: Date.new(2024, 6, 1))

    expect {
      described_class.call(record: record, params: { effective_date: "2024-01-01" })
    }.to raise_error(ActiveRecord::RecordInvalid)
  end
end
