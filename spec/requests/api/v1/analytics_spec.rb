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
      "by_type" => [ include("employment_type" => "full-time", "headcount" => 1) ],
      "by_department" => [ include("department" => "engineering", "headcount" => 1) ],
      "by_country" => [ include("country" => "GB", "headcount" => 1) ],
      "fx_rates" => include(include("currency" => "GBP"))
    )
  end

  it "answers a payroll question" do
    sign_in_hr
    create(:compensation_record, employee: create(:employee), base_amount: 80_000, currency: "GBP")

    post "/api/v1/analytics/ask", params: { question: "What is the total annualised payroll?" }, as: :json

    expect(response).to have_http_status(:ok)
    expect(api_data).to include("answer" => a_string_including("100,000 USD"))
  end

  it "rejects a blank question" do
    sign_in_hr
    post "/api/v1/analytics/ask", params: { question: "" }, as: :json

    expect(response).to have_http_status(:unprocessable_content)
    expect(api_error).to include("code" => "invalid_request", "message" => "question is required")
  end
end
