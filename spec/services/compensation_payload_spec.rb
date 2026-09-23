require "rails_helper"

RSpec.describe CompensationPayload do
  before { ExchangeRate.seed!(on: Date.new(2024, 1, 1)) }

  it "adds annualised USD to the API row" do
    record = create(:compensation_record, currency: "GBP", base_amount: 80_000)

    expect(described_class.call(record)).to include(
      id: record.id,
      currency: "GBP",
      annualised_usd: BigDecimal("100000.0")
    )
  end

  it "returns nil for a missing record" do
    expect(described_class.call(nil)).to be_nil
  end

  it "omits annualised USD when FX is missing" do
    employee = create(:employee, started_on: Date.new(2020, 1, 1))
    record = create(:compensation_record, employee: employee, currency: "GBP", base_amount: 80_000,
                                         effective_date: Date.new(2020, 1, 1))

    expect(described_class.call(record)[:annualised_usd]).to be_nil
  end
end
