require "rails_helper"

RSpec.describe EmployeeProfile do
  before { ExchangeRate.seed!(on: Date.new(2024, 1, 1)) }

  it "returns current pay and newest-first history" do
    employee = create(:employee)
    hire = create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1),
                                        base_amount: 80_000, currency: "GBP", change_reason: "hire")
    raise_record = create(:compensation_record, employee: employee, effective_date: Date.new(2025, 1, 1),
                                                base_amount: 90_000, currency: "GBP", change_reason: "raise")

    expect(described_class.call(employee)).to include(
      employee: include(id: employee.id),
      current_compensation: include(id: raise_record.id, annualised_usd: BigDecimal("112500.0")),
      compensation_records: satisfy { |rows| rows.pluck(:id) == [ raise_record.id, hire.id ] }
    )
  end
end
