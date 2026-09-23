require "rails_helper"

RSpec.describe EmployeeProfile do
  before { ExchangeRate.seed!(on: Date.new(2024, 1, 1)) }

  it "returns current pay and newest-first history" do
    employee = create(:employee)
    hire = create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1),
                                        base_amount: 80_000, currency: "GBP", change_reason: "hire")
    raise_record = create(:compensation_record, employee: employee, effective_date: Date.new(2025, 1, 1),
                                                base_amount: 90_000, currency: "GBP", change_reason: "raise")

    payload = described_class.call(employee)
    expect(payload).to include(
      employee: include(id: employee.id),
      current_compensation: include(id: raise_record.id, annualised_usd: BigDecimal("112500.0")),
      compensation_records: satisfy { |rows| rows.pluck(:id) == [ raise_record.id, hire.id ] },
      audit_events: []
    )
    expect(payload).to have_key(:pay_band)
  end
end
