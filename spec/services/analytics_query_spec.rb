require "rails_helper"

RSpec.describe AnalyticsQuery do
  def usd(amount, currency:, pay_period: "annual", hours_per_week: nil)
    CurrencyNormalizer.new.annualised_usd(
      amount: amount, currency: currency, pay_period: pay_period,
      hours_per_week: hours_per_week, as_of: Date.new(2024, 1, 1)
    )
  end

  before { ExchangeRate.seed!(on: Date.new(2024, 1, 1)) }

  it "sums current active payroll and reports average and median" do
    create(:compensation_record, employee: create(:employee, email: "a@acme.test"),
                                 base_amount: 60_000, currency: "USD")
    create(:compensation_record, employee: create(:employee, email: "b@acme.test"),
                                 base_amount: 80_000, currency: "USD")
    create(:compensation_record, employee: create(:employee, email: "c@acme.test"),
                                 base_amount: 80_000, currency: "GBP")

    expect(described_class.call(as_of: Date.new(2026, 1, 1))).to include(
      headcount: 3,
      annualised_usd: usd(60_000, currency: "USD") + usd(80_000, currency: "USD") + usd(80_000, currency: "GBP"),
      average_usd: BigDecimal("80000.0"),
      median_usd: BigDecimal("80000.0")
    )
  end

  it "uses the current compensation row, not earlier history" do
    employee = create(:employee)
    create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1), base_amount: 50_000)
    create(:compensation_record, employee: employee, effective_date: Date.new(2025, 4, 1), base_amount: 90_000)

    expect(described_class.call(as_of: Date.new(2026, 1, 1))).to include(annualised_usd: 90_000)
  end

  it "excludes leavers from payroll" do
    create(:compensation_record, employee: create(:employee, email: "a@acme.test"), base_amount: 80_000)
    create(:compensation_record, employee: create(:employee, :left, email: "b@acme.test"), base_amount: 200_000)

    expect(described_class.call(as_of: Date.new(2026, 1, 1))).to include(annualised_usd: BigDecimal("80000.0"))
  end

  it "breaks active headcount down by type and department" do
    create(:compensation_record,
           employee: create(:employee, email: "eng@acme.test", department: "engineering",
                                       employment_type: "full-time"),
           base_amount: 100_000)
    create(:compensation_record,
           employee: create(:employee, email: "sales@acme.test", department: "sales",
                                       employment_type: "contractor"),
           base_amount: 50_000)

    expect(described_class.call(as_of: Date.new(2026, 1, 1))).to include(
      by_type: contain_exactly(
        include(employment_type: "contractor", headcount: 1, payroll_usd: BigDecimal("50000.0")),
        include(employment_type: "full-time", headcount: 1, payroll_usd: BigDecimal("100000.0"))
      ),
      by_department: contain_exactly(
        include(department: "engineering", headcount: 1),
        include(department: "sales", headcount: 1)
      )
    )
  end

  it "annualises hourly pay in SQL" do
    create(:compensation_record, :hourly,
           employee: create(:employee),
           base_amount: 50, hours_per_week: 40, currency: "USD")

    expect(described_class.call(as_of: Date.new(2026, 1, 1))).to include(
      annualised_usd: usd(50, currency: "USD", pay_period: "hourly", hours_per_week: 40)
    )
  end

  it "ignores compensation that is not yet effective" do
    employee = create(:employee)
    create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1), base_amount: 70_000)
    create(:compensation_record, employee: employee, effective_date: Date.new(2026, 6, 1), base_amount: 120_000)

    expect(described_class.call(as_of: Date.new(2025, 1, 1))).to include(annualised_usd: 70_000)
  end

  it "includes this month's payout for people who left in the month" do
    create(:compensation_record, employee: create(:employee, email: "a@acme.test"), base_amount: 120_000)
    create(:compensation_record,
           employee: create(:employee, :left, email: "b@acme.test", left_on: Date.new(2026, 1, 10)),
           base_amount: 60_000)

    expect(described_class.call(as_of: Date.new(2026, 1, 20))).to include(
      annualised_usd: BigDecimal("120000.0"),
      monthly_usd: BigDecimal("15000.0")
    )
  end

  it "returns zeros when the directory is empty" do
    expect(described_class.call).to include(
      headcount: 0, annualised_usd: 0, average_usd: nil, median_usd: nil,
      monthly_usd: 0, by_type: [], by_department: [], by_country: []
    )
  end

  it "exposes the latest USD quotes used for annualisation" do
    expect(described_class.call(as_of: Date.new(2026, 1, 1))[:fx_rates]).to include(
      include(currency: "USD", to_usd: BigDecimal("1.0")),
      include(currency: "GBP", to_usd: BigDecimal("1.25"))
    )
  end
end
