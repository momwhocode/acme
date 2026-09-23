require "rails_helper"

RSpec.describe "GET /api/v1/analytics" do
  before { ExchangeRate.seed!(on: Date.new(2024, 1, 1)) }

  it "requires login" do
    get "/api/v1/analytics"

    expect(response).to have_http_status(:unauthorized)
    expect(api_error).to include("code" => "unauthorized")
  end

  it "returns payroll and headcount mix from SQL aggregations" do
    sign_in_hr
    create(:compensation_record,
           employee: create(:employee, email: "ada@acme.test", department: "engineering",
                                       employment_type: "full-time"),
           base_amount: 80_000, currency: "GBP")
    create(:compensation_record,
           employee: create(:employee, :left, email: "left@acme.test"),
           base_amount: 10_000)

    get "/api/v1/analytics"

    expect(response).to have_http_status(:ok)
    expect(api_data).to include(
      "headcount" => 1,
      "annualised_usd" => "100000.0",
      "average_usd" => "100000.0",
      "median_usd" => "100000.0",
      "by_type" => [ include("employment_type" => "full-time", "headcount" => 1, "currency" => "GBP") ],
      "by_department" => [ include("department" => "engineering", "headcount" => 1, "currency" => "GBP") ],
      "by_country" => [ include("country" => "GB", "headcount" => 1, "currency" => "GBP", "payroll_local" => "80000.0") ],
      "by_level" => be_an(Array),
      "actions" => include("onboarding", "offboarding", "contracts", "recent"),
      "fx_rates" => include(include("currency" => "GBP"))
    )
  end

  it "snapshots payroll on as_of" do
    sign_in_hr
    employee = create(:employee)
    create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1), base_amount: 70_000,
                                 currency: "USD")
    create(:compensation_record, employee: employee, effective_date: Date.new(2026, 6, 1), base_amount: 120_000,
                                 currency: "USD")

    get "/api/v1/analytics", params: { as_of: "2025-01-01" }

    expect(response).to have_http_status(:ok)
    expect(api_data).to include("annualised_usd" => "70000.0")
  end

  it "filters the snapshot by mix slice" do
    sign_in_hr
    create(:compensation_record,
           employee: create(:employee, email: "eng@acme.test", department: "engineering"),
           base_amount: 80_000, currency: "USD")
    create(:compensation_record,
           employee: create(:employee, email: "sales@acme.test", department: "sales"),
           base_amount: 50_000, currency: "USD")

    get "/api/v1/analytics", params: { department: "engineering" }

    expect(response).to have_http_status(:ok)
    expect(api_data).to include("headcount" => 1, "annualised_usd" => "80000.0")
  end

  it "rejects an invalid as_of" do
    sign_in_hr

    get "/api/v1/analytics", params: { as_of: "not-a-date" }

    expect(response).to have_http_status(:unprocessable_content)
    expect(api_error).to include("code" => "invalid_request", "message" => "as_of is invalid")
  end
end
