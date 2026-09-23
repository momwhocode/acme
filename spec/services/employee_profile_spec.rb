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

  it "includes the pay band and recent audit events" do
    employee = create(:employee, level: "IC2")
    hire = create(:compensation_record, employee: employee, currency: "USD", base_amount: 85_000)
    create(:pay_band, level: "IC2", currency: "USD", midpoint: 85_000)
    AuditRecorder.record(actor: create(:user), action: "onboard", record: employee)

    payload = described_class.call(employee.reload)

    expect(payload[:current_compensation]).to include(id: hire.id)
    expect(payload[:pay_band]).to include(level: "IC2", compa_ratio: 1.0)
  end

  it "includes recent audit events" do
    employee = create(:employee, level: "IC2")
    create(:compensation_record, employee: employee, currency: "USD", base_amount: 85_000)
    create(:pay_band, level: "IC2", currency: "USD", midpoint: 85_000)
    AuditRecorder.record(actor: create(:user), action: "onboard", record: employee)

    payload = described_class.call(employee.reload)

    expect(payload[:audit_events].first).to include(action: "onboard", record_type: "Employee")
  end
end
