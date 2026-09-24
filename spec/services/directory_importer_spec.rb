require "rails_helper"

RSpec.describe DirectoryImporter do
  def import_fixture
    described_class.call(Rails.root.join("spec/fixtures/files/directory.csv"))
  end

  def import_csv(*lines)
    path = Rails.root.join("tmp/directory_import_spec.csv")
    File.write(path, ([ described_class::REQUIRED_HEADERS.join(",") ] + lines).join("\n") + "\n")
    described_class.call(path)
  end

  def csv_row(overrides = {})
    values = {
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada.lovelace@import.test",
      country: "GB",
      department: "Engineering",
      employment_type: "full-time",
      status: "active",
      level: "IC4",
      job_title: "Engineer",
      started_on: "2020-01-15",
      left_on: "",
      base_amount: "80000",
      currency: "GBP",
      pay_period: "annual",
      hours_per_week: "",
      effective_date: "2020-01-15",
      change_reason: "hire"
    }.merge(overrides)

    described_class::REQUIRED_HEADERS.map { |key| values.fetch(key.to_sym) }.join(",")
  end

  it "imports unique employees from the spreadsheet" do
    expect { import_fixture }.to change(Employee, :count).by(2)
  end

  it "imports effective-dated compensation rows" do
    expect { import_fixture }.to change(CompensationRecord, :count).by(3)
  end

  it "normalises country and department" do
    import_fixture

    expect(Employee.find_by!(email: "ada.lovelace@import.test")).to have_attributes(
      country: "GB",
      department: "engineering",
      job_title: "Engineer"
    )
  end

  it "imports job_title from the required column" do
    import_csv(csv_row(job_title: "Staff Engineer"))

    expect(Employee.find_by!(email: "ada.lovelace@import.test").job_title).to eq("Staff Engineer")
  end

  it "allows a blank job_title" do
    import_csv(csv_row(job_title: ""))

    expect(Employee.find_by!(email: "ada.lovelace@import.test").job_title).to be_nil
  end

  it "attaches both Ada raises to the same employee" do
    import_fixture
    ada = Employee.find_by!(email: "ada.lovelace@import.test")

    expect(ada.compensation_records.count).to eq(2)
  end

  it "updates emails that already exist" do
    import_fixture
    result = import_fixture

    expect(result).to include(employees: 0, updated: 2)
  end

  it "imports the published column template" do
    expect(described_class.call(Rails.root.join("public/templates/acme-employees.csv"))).to include(
      employees: 1, compensation_records: 1
    )
  end

  it "accepts an IO with a path" do
    File.open(Rails.root.join("spec/fixtures/files/directory.csv")) do |file|
      expect(described_class.call(file)).to include(employees: 2)
    end
  end

  it "rejects a file over the size cap" do
    path = Rails.root.join("tmp/directory_too_large.csv")
    File.write(path, "x" * (described_class::MAX_BYTES + 1))

    expect { described_class.call(path) }.to raise_error(described_class::Error, /too large/)
  end

  it "refreshes compensation for an existing email without duplicating rows" do
    import_fixture

    expect { import_fixture }.not_to change(CompensationRecord, :count)
  end

  it "does not write the FX matrix" do
    expect { import_fixture }.not_to change(ExchangeRate, :count)
  end

  it "imports rows that satisfy model validations" do
    import_fixture

    expect(Employee.find_each).to all(be_valid)
    expect(CompensationRecord.includes(:employee).find_each).to all(be_valid)
  end

  it "accepts headers with surrounding spaces" do
    path = Rails.root.join("tmp/directory_import_headers.csv")
    File.write(path, " first_name ,last_name,email,country,department,employment_type,status,level,job_title,started_on,left_on,base_amount,currency,pay_period,hours_per_week,effective_date,change_reason\n#{csv_row}\n")

    expect { described_class.call(path) }.to change(Employee, :count).by(1)
  end

  it "raises when FILE is missing" do
    expect { described_class.call(nil) }.to raise_error(described_class::Error, /required/)
  end

  it "raises when the CSV file is missing" do
    expect { described_class.call("/tmp/missing-directory.csv") }.to raise_error(described_class::Error, /not found/)
  end

  it "raises when a directory is passed instead of a file" do
    expect { described_class.call(Rails.root.join("tmp")) }.to raise_error(described_class::Error, /not found/)
  end

  it "raises when a required column is missing" do
    path = Rails.root.join("tmp/directory_missing.csv")
    File.write(path, "first_name,email\nAda,ada@acme.test\n")

    expect { described_class.call(path) }.to raise_error(described_class::Error, /missing columns/)
  end

  it "raises when the CSV has no header row" do
    path = Rails.root.join("tmp/directory_empty.csv")
    File.write(path, "")

    expect { described_class.call(path) }.to raise_error(described_class::Error, /header/)
  end

  it "raises when a row is missing email" do
    expect { import_csv(csv_row(email: "")) }.to raise_error(described_class::Error, /missing email/)
  end

  it "raises when started_on is not ISO8601" do
    expect { import_csv(csv_row(started_on: "15/01/2020")) }.to raise_error(described_class::Error, /ISO8601/)
  end

  it "raises when started_on is blank" do
    expect { import_csv(csv_row(started_on: "")) }.to raise_error(described_class::Error, /started_on is required/)
  end

  it "raises when employment_type is unknown" do
    expect { import_csv(csv_row(employment_type: "contractor-to-hire")) }.to raise_error(described_class::Error, /Employment type/)
  end

  it "raises when currency is unsupported" do
    expect { import_csv(csv_row(currency: "JPY")) }.to raise_error(described_class::Error, /Currency/)
  end

  it "raises when an hourly row omits hours_per_week" do
    expect {
      import_csv(csv_row(pay_period: "hourly", hours_per_week: "", base_amount: "45"))
    }.to raise_error(described_class::Error, /Hours per week/)
  end

  it "raises when a leaver has no left_on" do
    expect { import_csv(csv_row(status: "left", left_on: "")) }.to raise_error(described_class::Error, /Left on/)
  end

  it "raises when effective_date is duplicated for one email" do
    expect {
      import_csv(csv_row, csv_row(base_amount: "88000", change_reason: "raise"))
    }.to raise_error(described_class::Error, /duplicate effective_date/)
  end

  it "raises when compensation is before started_on" do
    expect { import_csv(csv_row(effective_date: "2019-01-01")) }.to raise_error(described_class::Error, /effective date/i)
  end

  it "raises when country is not a 2-letter code" do
    expect { import_csv(csv_row(country: "USA")) }.to raise_error(described_class::Error, /Country/)
  end

  it "inserts nothing when any row is invalid" do
    expect { import_csv(csv_row, csv_row(email: "bad@import.test", country: "USA")) }.to raise_error(described_class::Error)
    expect(Employee.count).to eq(0)
  end
end
