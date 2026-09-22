# == Schema Information
#
# Table name: employees
#
#  id              :uuid             not null, primary key
#  country         :string           not null
#  department      :string           not null
#  email           :string           not null
#  employment_type :string           not null
#  first_name      :string           not null
#  last_name       :string           not null
#  left_on         :date
#  level           :string
#  started_on      :date             not null
#  status          :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_employees_on_directory_filters  (department,country,employment_type,status)
#  index_employees_on_email              (email) UNIQUE
#
require "rails_helper"

RSpec.describe Employee do
  subject(:employee) { build(:employee) }

  describe "validations" do
    it "accepts a complete employee" do
      expect(employee).to be_valid
    end

    it "requires first_name" do
      expect(build(:employee, first_name: nil)).not_to be_valid
    end

    it "requires last_name" do
      expect(build(:employee, last_name: nil)).not_to be_valid
    end

    it "requires email" do
      expect(build(:employee, email: nil)).not_to be_valid
    end

    it "rejects an invalid email" do
      expect(build(:employee, email: "not-an-email")).not_to be_valid
    end

    it "rejects a duplicate email ignoring case" do
      create(:employee, email: "hr@acme.test")

      expect(build(:employee, email: "HR@acme.test")).not_to be_valid
    end

    it "requires country" do
      expect(build(:employee, country: nil)).not_to be_valid
    end

    it "requires department" do
      expect(build(:employee, department: nil)).not_to be_valid
    end

    it "requires started_on" do
      expect(build(:employee, started_on: nil)).not_to be_valid
    end

    it "rejects an unknown employment_type" do
      expect(build(:employee, employment_type: "contractor-to-hire")).not_to be_valid
    end

    it "accepts each product employment type" do
      expect(described_class::EMPLOYMENT_TYPES).to all(
        satisfy { |type| build(:employee, employment_type: type).valid? }
      )
    end

    it "rejects an unknown status" do
      expect(build(:employee, status: "onboarding")).not_to be_valid
    end

    it "accepts a leaver with left_on" do
      expect(build(:employee, :left)).to be_valid
    end

    it "requires left_on when status is left" do
      expect(build(:employee, status: "left", left_on: nil)).not_to be_valid
    end

    it "rejects left_on when status is active" do
      expect(build(:employee, left_on: Date.new(2025, 1, 1))).not_to be_valid
    end

    it "rejects left_on before started_on" do
      expect(
        build(:employee, :left, started_on: Date.new(2024, 6, 1), left_on: Date.new(2024, 1, 1))
      ).not_to be_valid
    end
  end

  describe "normalize_attributes" do
    it "strips and downcases email" do
      employee = build(:employee, email: "  HR@Acme.TEST  ")
      employee.validate

      expect(employee.email).to eq("hr@acme.test")
    end

    it "downcases employment_type and status" do
      employee = build(:employee, :left, employment_type: "Full-Time", status: "Left")
      employee.validate

      expect(employee.employment_type).to eq("full-time")
      expect(employee.status).to eq("left")
    end

    it "treats a blank level as nil" do
      employee = build(:employee, level: "  ")
      employee.validate

      expect(employee.level).to be_nil
    end
  end

  describe "associations" do
    it "destroys compensation records with the employee" do
      employee = create(:employee)
      create(:compensation_record, employee: employee)

      expect { employee.destroy! }.to change(CompensationRecord, :count).by(-1)
    end
  end
end
