require "rails_helper"

RSpec.describe "GET /api/v1/health" do
  it "returns ok" do
    get "/api/v1/health"

    expect(response).to have_http_status(:ok).and have_attributes(
      parsed_body: include("status" => "ok", "app" => "acme")
    )
  end
end
