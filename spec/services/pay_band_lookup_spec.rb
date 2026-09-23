require "rails_helper"

RSpec.describe PayBandLookup do
  it "returns midpoint and compa-ratio for a matching band" do
    employee = create(:employee, level: "IC2")
    compensation = create(:compensation_record, employee: employee, base_amount: 85_000, currency: "USD")
    create(:pay_band, level: "IC2", currency: "USD", midpoint: 85_000)

    expect(described_class.call(employee: employee, compensation: compensation)).to include(
      level: "IC2",
      currency: "USD",
      midpoint: 85_000,
      compa_ratio: 1.0
    )
  end

  it "returns nothing without a level or band" do
    employee = create(:employee, level: nil)
    compensation = create(:compensation_record, employee: employee)

    expect(described_class.call(employee: employee, compensation: compensation)).to be_nil
    expect(described_class.call(employee: create(:employee, level: "IC9"), compensation: compensation)).to be_nil
  end

  it "keeps the band when annualised pay cannot be computed" do
    employee = create(:employee, level: "IC2")
    compensation = build(:compensation_record, employee: employee, pay_period: "hourly", hours_per_week: nil)
    create(:pay_band, level: "IC2", currency: "USD", midpoint: 85_000)

    expect(described_class.call(employee: employee, compensation: compensation)).to include(
      midpoint: 85_000,
      compa_ratio: nil
    )
  end
end
