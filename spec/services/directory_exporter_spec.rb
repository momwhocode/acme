require "rails_helper"

RSpec.describe DirectoryExporter do
  before { ExchangeRate.seed!(on: Date.new(2024, 1, 1)) }

  def filtered_csv
    manager = create(:employee, first_name: "Priya", last_name: "Shah", email: "priya@acme.test")
    ada = create(:employee, first_name: "Ada", last_name: "Lovelace", country: "GB",
                           job_title: "Engineer", manager: manager)
    create(:compensation_record, employee: ada, currency: "GBP", base_amount: 80_000)
    create(:employee, first_name: "Grace", last_name: "Hopper", country: "US", email: "grace@acme.test")
    described_class.call(DirectoryQuery.new(country: "GB").relation)
  end

  it "writes the directory headers and matching rows" do
    csv = filtered_csv

    expect(csv).to include("Name,Email,Department,Country,Type,Status,Level,Job Title,Pay,Started,End Date,Manager")
    expect(csv).to include("Ada Lovelace")
    expect(csv).to include("Engineer")
    expect(csv).to include("100000.0")
  end

  it "exports end date for a leaver" do
    create(:employee, :left, first_name: "Grace", last_name: "Hopper", email: "grace@acme.test")
    csv = described_class.call(Employee.where(email: "grace@acme.test"))

    expect(csv).to include("2025-06-01")
  end

  it "includes the manager and excludes unmatched hires" do
    csv = filtered_csv

    expect(csv).to include("Priya Shah")
    expect(csv).not_to include("Grace Hopper")
  end
end
