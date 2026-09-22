require "rails_helper"

RSpec.describe DirectorySeeder do
  def seed(count: 20, force: true)
    described_class.call(count: count, force: force, rng: Random.new(1))
  end

  it "inserts the requested number of employees" do
    expect { seed }.to change(Employee, :count).by(20)
  end

  it "writes at least one compensation row per employee" do
    seed

    expect(CompensationRecord.distinct.count(:employee_id)).to eq(20)
  end

  it "seeds the static FX matrix" do
    seed

    expect(ExchangeRate.rate_to(from: "EUR", to: "USD", on: Date.current)).to eq(BigDecimal("1.10"))
  end

  it "skips when employees already exist" do
    seed
    result = described_class.call(count: 20, force: false)

    expect(result[:skipped]).to be(true)
    expect(Employee.count).to eq(20)
  end

  it "replaces existing rows when force is set" do
    seed(count: 10)
    seed(count: 8, force: true)

    expect(Employee.count).to eq(8)
  end

  it "does not delete exchange rates when force is set" do
    seed

    expect { seed(count: 5, force: true) }.not_to change(ExchangeRate, :count)
  end

  it "inserts nothing when count is zero" do
    expect { described_class.call(count: 0, force: true) }.not_to change(Employee, :count)
  end

  it "treats a negative count as zero" do
    expect { described_class.call(count: -3, force: true) }.not_to change(Employee, :count)
  end

  it "restores Faker's random after running" do
    previous = Random.new(99)
    Faker::Config.random = previous
    seed

    expect(Faker::Config.random).to eq(previous)
  end

  describe "generated directory" do
    before { seed }

    it "keeps compensation inside the employment window" do
      outside = CompensationRecord.joins(:employee).where(
        "compensation_records.effective_date < employees.started_on OR " \
        "(employees.left_on IS NOT NULL AND compensation_records.effective_date > employees.left_on)"
      )

      expect(outside).to be_empty
    end

    it "stores hourly rows with hours_per_week" do
      hourly = CompensationRecord.where(pay_period: "hourly")

      expect(hourly).to be_present
      expect(hourly.where(hours_per_week: nil)).to be_empty
    end

    it "normalises country and department for directory filters" do
      employee = Employee.first

      expect(employee.country).to eq(employee.country.upcase)
      expect(employee.department).to eq(employee.department.downcase)
    end

    it "uses Faker names rather than a hardcoded roster" do
      names = Employee.pluck(:first_name, :last_name)

      expect(names.uniq.size).to be > 1
      expect(names.flatten).to all(be_present)
    end

    it "writes unique emails" do
      expect(Employee.distinct.count(:email)).to eq(Employee.count)
    end

    it "writes unique compensation dates per employee" do
      duplicates = CompensationRecord.group(:employee_id, :effective_date).having("count(*) > 1")

      expect(duplicates).to be_empty
    end

    it "uses only product employment types" do
      expect(Employee.distinct.pluck(:employment_type)).to all(
        be_in(Employee::EMPLOYMENT_TYPES)
      )
    end

    it "uses only supported currencies" do
      expect(CompensationRecord.distinct.pluck(:currency)).to all(
        be_in(ExchangeRate.supported_currencies)
      )
    end

    it "uses only product pay periods" do
      expect(CompensationRecord.distinct.pluck(:pay_period)).to all(
        be_in(CompensationRecord::PAY_PERIODS)
      )
    end

    it "requires left_on on leavers" do
      expect(Employee.where(status: "left", left_on: nil)).to be_empty
    end

    it "omits level for interns, contractors, and freelancers" do
      contingent = Employee.where(employment_type: %w[intern contractor freelancer])

      expect(contingent.where.not(level: nil)).to be_empty
    end

    it "stores positive compensation amounts" do
      expect(CompensationRecord.where("base_amount <= 0")).to be_empty
    end

    it "produces rows that satisfy model validations" do
      expect(Employee.find_each).to all(be_valid)
      expect(CompensationRecord.includes(:employee).find_each).to all(be_valid)
    end

    it "uses 2-letter country codes" do
      expect(Employee.distinct.pluck(:country)).to all(match(/\A[A-Z]{2}\z/))
    end
  end
end
