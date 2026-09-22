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
#  index_employees_on_directory_search   (((((((first_name)::text || ' '::text) || (last_name)::text) || ' '::text) || (email)::text)) gin_trgm_ops) USING gin
#  index_employees_on_lower_email        (lower((email)::text)) UNIQUE
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

    it "accepts a future left_on while active" do
      expect(build(:employee, left_on: Date.new(2025, 1, 1))).to be_valid
    end

    it "rejects left_on before started_on" do
      expect(
        build(:employee, :left, started_on: Date.new(2024, 6, 1), left_on: Date.new(2024, 1, 1))
      ).not_to be_valid
    end

    it "accepts left_on on the start date" do
      expect(
        build(:employee, :left, started_on: Date.new(2024, 6, 1), left_on: Date.new(2024, 6, 1))
      ).to be_valid
    end

    it "rejects a blank first_name" do
      expect(build(:employee, first_name: "  ")).not_to be_valid
    end

    it "rejects a first_name longer than 255 characters" do
      expect(build(:employee, first_name: "A" * 256)).not_to be_valid
    end

    it "rejects a last_name longer than 255 characters" do
      expect(build(:employee, last_name: "A" * 256)).not_to be_valid
    end

    it "rejects a country longer than 255 characters" do
      expect(build(:employee, country: "A" * 256)).not_to be_valid
    end

    it "rejects a country that is not a 2-letter code" do
      expect(build(:employee, country: "USA")).not_to be_valid
    end

    it "rejects a single-letter country" do
      expect(build(:employee, country: "G")).not_to be_valid
    end

    it "rejects a department longer than 255 characters" do
      expect(build(:employee, department: "A" * 256)).not_to be_valid
    end

    it "rejects an email longer than 255 characters" do
      expect(build(:employee, email: "#{"a" * 251}@x.io")).not_to be_valid
    end

    it "rejects a level longer than 50 characters" do
      expect(build(:employee, level: "L" * 51)).not_to be_valid
    end

    it "accepts an optional level" do
      expect(build(:employee, level: "IC4")).to be_valid
    end

    it "requires employment_type" do
      expect(build(:employee, employment_type: nil)).not_to be_valid
    end

    it "requires status" do
      expect(build(:employee, status: nil)).not_to be_valid
    end

    it "allows the same record to keep its email" do
      employee = create(:employee, email: "hr@acme.test")
      employee.last_name = "Byron"

      expect(employee).to be_valid
    end

    it "rejects moving started_on after existing compensation" do
      employee = create(:employee, started_on: Date.new(2024, 1, 1))
      create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1))
      employee.started_on = Date.new(2024, 6, 1)

      expect(employee).not_to be_valid
    end

    it "rejects a leave date before existing compensation" do
      employee = create(:employee, started_on: Date.new(2024, 1, 1))
      create(:compensation_record, employee: employee, effective_date: Date.new(2024, 6, 1))
      employee.status = "left"
      employee.left_on = Date.new(2024, 3, 1)

      expect(employee).not_to be_valid
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

    it "strips names" do
      employee = build(:employee, first_name: " Ada ", last_name: " Lovelace ")
      employee.validate

      expect(employee.first_name).to eq("Ada")
      expect(employee.last_name).to eq("Lovelace")
    end

    it "upcases country and downcases department" do
      employee = build(:employee, country: " gb ", department: "  Engineering  ")
      employee.validate

      expect(employee.country).to eq("GB")
      expect(employee.department).to eq("engineering")
    end
  end

  describe "associations" do
    it "does not destroy an employee who has compensation records" do
      employee = create(:employee)
      create(:compensation_record, employee: employee)

      expect(employee.destroy).to be(false)
    end

    it "destroys an employee with no compensation records" do
      employee = create(:employee)

      expect { employee.destroy! }.to change(described_class, :count).by(-1)
    end

    it "exposes compensation_records" do
      employee = create(:employee)
      record = create(:compensation_record, employee: employee)

      expect(employee.compensation_records).to contain_exactly(record)
    end
  end

  describe "#as_directory_json" do
    it "returns the list fields" do
      employee = create(:employee, first_name: "Ada", last_name: "Lovelace")

      expect(employee.as_directory_json).to include(
        id: employee.id,
        first_name: "Ada",
        last_name: "Lovelace",
        email: employee.email
      )
    end
  end
end
