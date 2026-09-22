# == Schema Information
#
# Table name: compensation_records
#
#  id             :uuid             not null, primary key
#  base_amount    :decimal(15, 2)   not null
#  change_reason  :string
#  currency       :string(3)        not null
#  effective_date :date             not null
#  hours_per_week :decimal(5, 2)
#  pay_period     :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  employee_id    :uuid             not null
#
# Indexes
#
#  index_compensation_records_on_employee_id_and_effective_date  (employee_id,effective_date) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (employee_id => employees.id)
#
require "rails_helper"

RSpec.describe CompensationRecord do
  subject(:record) { build(:compensation_record) }

  describe "validations" do
    it "accepts a complete record" do
      expect(record).to be_valid
    end

    it "requires an employee" do
      expect(build(:compensation_record, employee: nil)).not_to be_valid
    end

    it "requires base_amount" do
      expect(build(:compensation_record, base_amount: nil)).not_to be_valid
    end

    it "rejects a negative base_amount" do
      expect(build(:compensation_record, base_amount: -1)).not_to be_valid
    end

    it "allows a zero base_amount" do
      expect(build(:compensation_record, base_amount: 0)).to be_valid
    end

    it "requires currency" do
      expect(build(:compensation_record, currency: nil)).not_to be_valid
    end

    it "requires a 3-letter currency" do
      expect(build(:compensation_record, currency: "US")).not_to be_valid
    end

    it "requires pay_period" do
      expect(build(:compensation_record, pay_period: nil)).not_to be_valid
    end

    it "rejects an unknown pay_period" do
      expect(build(:compensation_record, pay_period: "weekly")).not_to be_valid
    end

    it "requires effective_date" do
      expect(build(:compensation_record, effective_date: nil)).not_to be_valid
    end

    it "rejects a second record for the same employee and date" do
      existing = create(:compensation_record)

      expect(
        build(:compensation_record, employee: existing.employee, effective_date: existing.effective_date)
      ).not_to be_valid
    end

    it "allows the same date on a different employee" do
      existing = create(:compensation_record)

      expect(
        build(:compensation_record, effective_date: existing.effective_date)
      ).to be_valid
    end

    it "requires hours_per_week for hourly pay" do
      expect(build(:compensation_record, pay_period: "hourly", hours_per_week: nil)).not_to be_valid
    end

    it "rejects non-positive hours_per_week" do
      expect(build(:compensation_record, :hourly, hours_per_week: 0)).not_to be_valid
    end

    it "does not require hours_per_week for annual pay" do
      expect(build(:compensation_record, pay_period: "annual", hours_per_week: nil)).to be_valid
    end
  end

  describe "normalize_attributes" do
    it "upcases currency and downcases pay_period" do
      record = build(:compensation_record, currency: " eur ", pay_period: " MONTHLY ")
      record.validate

      expect(record.currency).to eq("EUR")
      expect(record.pay_period).to eq("monthly")
    end

    it "treats a blank change_reason as nil" do
      record = build(:compensation_record, change_reason: "  ")
      record.validate

      expect(record.change_reason).to be_nil
    end
  end
end
