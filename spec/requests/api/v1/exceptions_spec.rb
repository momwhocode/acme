require "rails_helper"

RSpec.describe "API exception handler" do
  def json_headers
    { "CONTENT_TYPE" => "application/json", "ACCEPT" => "application/json" }
  end

  def raise_on_directory(error)
    sign_in_hr
    allow(DirectoryQuery).to receive(:new).and_raise(error)
    get "/api/v1/employees"
  end

  def envelope_for(path, exception, status: 404)
    env = Rack::MockRequest.env_for("/#{status}")
    env["action_dispatch.exception"] = exception
    env["action_dispatch.original_path"] = path
    env["PATH_INFO"] = "/#{status}"
    code, headers, body = Rails.application.config.exceptions_app.call(env)
    raw = +""
    body.each { |chunk| raw << chunk }
    body.close if body.respond_to?(:close)
    [ code, headers, raw ]
  end

  it "returns not found for an unknown v1 route" do
    get "/api/v1/does-not-exist"

    expect(response).to have_http_status(:not_found)
    expect(response.parsed_body).to eq("error" => { "code" => "not_found", "message" => "not found" })
  end

  it "returns not found for an unknown API namespace" do
    get "/api/legacy"

    expect(response).to have_http_status(:not_found)
    expect(api_error).to include("code" => "not_found")
  end

  it "returns not found for /api" do
    get "/api"

    expect(response).to have_http_status(:not_found)
    expect(api_error).to include("code" => "not_found")
  end

  it "returns not found for an unsupported method" do
    delete "/api/v1/employees"

    expect(response).to have_http_status(:not_found)
    expect(api_error).to include("code" => "not_found")
  end

  it "returns invalid json for a broken body" do
    sign_in_hr
    post "/api/v1/employees", params: "{", headers: json_headers

    expect(response).to have_http_status(:bad_request)
    expect(api_error).to include("code" => "invalid_request", "message" => "invalid json")
  end

  it "returns invalid json on sign in" do
    post "/api/v1/session", params: "{", headers: json_headers

    expect(response).to have_http_status(:bad_request)
    expect(api_error).to include("message" => "invalid json")
  end

  it "maps a domain error to invalid_request" do
    raise_on_directory(AppError.new("nope"))

    expect(response).to have_http_status(:unprocessable_content)
    expect(api_error).to include("code" => "invalid_request", "message" => "nope")
  end

  it "maps a record invalid error to validation_failed" do
    record = Employee.new
    record.validate
    raise_on_directory(ActiveRecord::RecordInvalid.new(record))

    expect(response).to have_http_status(:unprocessable_content)
    expect(api_error).to include("code" => "validation_failed", "details" => include("first_name"))
  end

  it "maps a uniqueness race to conflict" do
    raise_on_directory(ActiveRecord::RecordNotUnique.new("PG::UniqueViolation"))

    expect(response).to have_http_status(:conflict)
    expect(api_error).to include("code" => "conflict", "message" => "already exists")
  end

  it "maps a missing param to invalid_request" do
    raise_on_directory(ActionController::ParameterMissing.new(:compensation))

    expect(response).to have_http_status(:unprocessable_content)
    expect(api_error).to include("code" => "invalid_request")
  end

  it "maps a bad request to invalid_request" do
    raise_on_directory(ActionController::BadRequest.new("bad"))

    expect(response).to have_http_status(:bad_request)
    expect(api_error).to include("code" => "invalid_request", "message" => "bad request")
  end

  it "maps a missing record without leaking the query" do
    raise_on_directory(ActiveRecord::RecordNotFound.new("Couldn't find Employee"))

    expect(response).to have_http_status(:not_found)
    expect(response.body).not_to include("Couldn't find Employee")
  end

  it "returns internal error without leaking the exception" do
    raise_on_directory(RuntimeError.new("secret failure"))

    expect(response).to have_http_status(:internal_server_error)
    expect(response.parsed_body).to eq("error" => { "code" => "internal_error", "message" => "internal error" })
  end

  it "renders the API envelope from exceptions_app" do
    status, _headers, raw = envelope_for("/api/v1/x", ActionController::RoutingError.new("No route"))

    expect(status).to eq(404)
    expect(JSON.parse(raw)).to eq("error" => { "code" => "not_found", "message" => "not found" })
  end

  it "hides unexpected exceptions_app failures" do
    status, _headers, raw = envelope_for("/api/v1/employees", RuntimeError.new("secret failure"), status: 500)

    expect(status).to eq(500)
    expect(raw).not_to include("secret failure")
  end

  it "leaves HTML public exceptions for non-API paths" do
    status, headers, _raw = envelope_for("/missing-page", ActionController::RoutingError.new("No route"))

    expect(status).to eq(404)
    expect(headers["content-type"]).to include("text/html")
  end

  it "renders the branded not-found page for HTML" do
    _status, _headers, raw = envelope_for("/missing-page", ActionController::RoutingError.new("No route"))

    expect(raw).to include("Page not found")
    expect(raw).to include("Acme")
  end
end
