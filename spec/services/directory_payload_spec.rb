require "rails_helper"

RSpec.describe DirectoryPayload do
  it "includes current compensation with annualised USD" do
    ExchangeRate.seed!(on: Date.new(2024, 1, 1))
    employee = create(:employee)
    create(:compensation_record, employee: employee, currency: "GBP", base_amount: 80_000)

    payload = described_class.employees([ employee ]).first

    expect(payload.fetch(:current_compensation)).to include(
      currency: "GBP",
      annualised_usd: a_value > 0
    )
  end

  it "returns distinct department and country facets" do
    create(:employee, department: "engineering", country: "GB")
    create(:employee, department: "sales", country: "US", email: "sales@acme.test")
    create(:employee, department: "engineering", country: "GB", email: "eng2@acme.test")

    expect(described_class.facets).to include(
      departments: %w[engineering sales],
      countries: %w[GB US]
    )
  end

  it "uses left_on as the compensation cutoff for leavers" do
    ExchangeRate.seed!(on: Date.new(2024, 1, 1))
    employee = create(:employee)
    older = create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1),
                                         base_amount: 70_000, currency: "USD")
    create(:compensation_record, employee: employee, effective_date: Date.new(2026, 1, 1),
                                 base_amount: 120_000, currency: "USD")
    employee.update_columns(status: "left", left_on: Date.new(2025, 6, 1))

    payload = described_class.employees([ employee.reload ]).first

    expect(payload.dig(:current_compensation, :id)).to eq(older.id)
    expect(payload.dig(:current_compensation, :annualised_usd)).to eq(70_000.to_d)
  end
end
