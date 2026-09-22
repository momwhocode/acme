require "rails_helper"

RSpec.describe "API docs" do
  it "serves Swagger UI" do
    get "/api-docs"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include("swagger-ui")
  end

  it "serves the OpenAPI document" do
    get "/api-docs/v1/swagger.yaml"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include("ACME Salary Management API")
  end
end
