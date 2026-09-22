require "rails_helper"

RSpec.describe "GET /api/v1/employees/:id" do
  before { ExchangeRate.seed!(on: Date.new(2024, 1, 1)) }

  it "requires login" do
    get "/api/v1/employees/#{create(:employee).id}"

    expect(response).to have_http_status(:unauthorized)
  end

  it "returns the profile and compensation timeline" do
    sign_in_hr
    employee = create(:employee, first_name: "Ada")
    create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1), change_reason: "hire")
    current = create(:compensation_record, employee: employee, effective_date: Date.new(2025, 4, 1),
                                           change_reason: "promotion")

    get "/api/v1/employees/#{employee.id}"

    expect(response).to have_http_status(:ok)
    expect(api_data).to include(
      "employee" => include("id" => employee.id, "first_name" => "Ada"),
      "current_compensation" => include("id" => current.id),
      "compensation_records" => [ include("change_reason" => "promotion"), include("change_reason" => "hire") ]
    )
  end

  it "returns not found for an unknown employee" do
    sign_in_hr
    get "/api/v1/employees/#{SecureRandom.uuid}"

    expect(response).to have_http_status(:not_found)
    expect(api_error).to include("code" => "not_found")
  end
end
