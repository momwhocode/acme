require "rails_helper"

RSpec.describe "HR session" do
  def sign_in_as(email:, password:)
    post "/api/v1/session", params: { email: email, password: password }, as: :json
  end

  it "signs the HR manager in" do
    user = create(:user, email: "hr@acme.test", password: "password")
    sign_in_as(email: "HR@acme.test", password: "password")

    expect(response).to have_http_status(:created)
    expect(api_data.fetch("user")).to include(
      "id" => user.id,
      "email" => "hr@acme.test",
      "first_name" => "Sharvari",
      "last_name" => "Potnis"
    )
  end

  it "returns a csrf token after sign in" do
    create(:user, email: "hr@acme.test", password: "password")
    sign_in_as(email: "hr@acme.test", password: "password")

    expect(api_meta.fetch("csrf_token")).to be_present
  end

  it "rejects a wrong password with a generic error" do
    create(:user, email: "hr@acme.test", password: "password")
    sign_in_as(email: "hr@acme.test", password: "wrong-password")

    expect(response).to have_http_status(:unauthorized)
    expect(api_error).to include("code" => "invalid_credentials", "message" => "Invalid email or password")
  end

  it "rejects an unknown email with the same error" do
    sign_in_as(email: "missing@acme.test", password: "password")

    expect(response).to have_http_status(:unauthorized)
    expect(api_error).to include("code" => "invalid_credentials", "message" => "Invalid email or password")
  end

  it "rejects blank credentials with the same error" do
    sign_in_as(email: "", password: "")

    expect(response).to have_http_status(:unauthorized)
    expect(api_error).to include("code" => "invalid_credentials")
  end

  it "does not include the password digest" do
    create(:user, email: "hr@acme.test", password: "password")
    sign_in_as(email: "hr@acme.test", password: "password")

    expect(api_data.fetch("user").keys).not_to include("password_digest")
  end

  it "requires a session to read the current user" do
    get "/api/v1/session"

    expect(response).to have_http_status(:unauthorized)
    expect(api_error).to include("code" => "unauthorized")
  end

  it "returns the signed-in HR user" do
    user = create(:user, email: "hr@acme.test", password: "password")
    sign_in_as(email: user.email, password: "password")
    get "/api/v1/session"

    expect(response).to have_http_status(:ok)
    expect(api_data.dig("user", "id")).to eq(user.id)
  end

  it "returns a csrf token with the current session" do
    user = create(:user, password: "password")
    sign_in_as(email: user.email, password: "password")
    get "/api/v1/session"

    expect(api_meta.fetch("csrf_token")).to be_present
  end

  it "signs the HR manager out" do
    create(:user, email: "hr@acme.test", password: "password")
    sign_in_as(email: "hr@acme.test", password: "password")
    delete "/api/v1/session"
    get "/api/v1/session"

    expect(response).to have_http_status(:unauthorized)
  end

  it "allows sign out when no session exists" do
    delete "/api/v1/session"

    expect(response).to have_http_status(:ok)
    expect(api_meta.fetch("csrf_token")).to be_present
  end

  it "rejects a sign in without a csrf token when protection is on" do
    previous = Api::V1::BaseController.allow_forgery_protection
    Api::V1::BaseController.allow_forgery_protection = true
    create(:user, email: "hr@acme.test", password: "password")
    sign_in_as(email: "hr@acme.test", password: "password")

    expect(response).to have_http_status(:unprocessable_content)
    expect(api_error).to include("code" => "invalid_token")
  ensure
    Api::V1::BaseController.allow_forgery_protection = previous
  end
end
