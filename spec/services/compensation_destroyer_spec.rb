require "rails_helper"

RSpec.describe CompensationDestroyer do
  it "deletes a pay row when more than one exists" do
    employee = create(:employee)
    create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1))
    later = create(:compensation_record, employee: employee, effective_date: Date.new(2025, 1, 1),
                                         base_amount: 90_000)

    described_class.call(record: later)

    expect(CompensationRecord.find_by(id: later.id)).to be_nil
    expect(employee.compensation_records.count).to eq(1)
  end

  it "keeps the last pay row" do
    record = create(:compensation_record)

    expect {
      described_class.call(record: record)
    }.to raise_error(described_class::Error, "cannot delete the only pay record")
  end
end
