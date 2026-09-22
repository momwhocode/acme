require "rails_helper"

RSpec.describe "GET /api/v1/employees" do
  it "requires login" do
    get "/api/v1/employees"

    expect(response).to have_http_status(:unauthorized)
  end

  it "returns a directory page" do
    sign_in_hr
    employee = create(:employee, first_name: "Ada", last_name: "Lovelace")

    get "/api/v1/employees"

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to include(
      "employees" => [ include("id" => employee.id, "email" => employee.email) ],
      "pagination" => include("page" => 1, "count" => 1, "limit" => 25)
    )
  end

  it "paginates on the server" do
    sign_in_hr
    create(:employee, first_name: "Ann", last_name: "Alpha", email: "a@acme.test")
    create(:employee, first_name: "Zed", last_name: "Zeta", email: "z@acme.test")

    get "/api/v1/employees", params: { page: 2, per_page: 1 }

    expect(response.parsed_body.fetch("employees").pluck("last_name")).to eq([ "Zeta" ])
    expect(response.parsed_body.fetch("pagination")).to include("page" => 2, "pages" => 2, "count" => 2)
  end

  it "filters and searches" do
    sign_in_hr
    match = create(:employee, first_name: "Ada", country: "GB", department: "engineering",
                              employment_type: "full-time", status: "active")
    create(:employee, first_name: "Grace", country: "US", department: "sales",
                      email: "grace@acme.test")

    get "/api/v1/employees", params: { country: "gb", department: "engineering",
                                       type: "full-time", status: "active", q: "ada" }

    expect(response.parsed_body.fetch("employees").pluck("id")).to eq([ match.id ])
  end

  it "rejects an unknown filter" do
    sign_in_hr
    get "/api/v1/employees", params: { type: "contractor-plus" }

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.parsed_body).to eq("error" => "unknown type")
  end

  it "returns an empty page past the last page" do
    sign_in_hr
    create(:employee)

    get "/api/v1/employees", params: { page: 9 }

    expect(response.parsed_body.fetch("employees")).to eq([])
    expect(response.parsed_body.fetch("pagination")).to include("page" => 9, "count" => 1)
  end

  it "rejects an unknown status" do
    sign_in_hr
    get "/api/v1/employees", params: { status: "onboarding" }

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.parsed_body).to eq("error" => "unknown status")
  end

  it "rejects a country that is not ISO-2" do
    sign_in_hr
    get "/api/v1/employees", params: { country: "USA" }

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.parsed_body).to eq("error" => "unknown country")
  end

  it "clamps per_page" do
    sign_in_hr
    get "/api/v1/employees", params: { per_page: 500 }

    expect(response.parsed_body.dig("pagination", "limit")).to eq(100)
  end

  it "filters by employment_type" do
    sign_in_hr
    match = create(:employee, employment_type: "intern")
    create(:employee, employment_type: "full-time", email: "ft@acme.test")

    get "/api/v1/employees", params: { employment_type: "intern" }

    expect(response.parsed_body.fetch("employees").pluck("id")).to eq([ match.id ])
  end
end
