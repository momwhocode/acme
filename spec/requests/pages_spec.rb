require "rails_helper"

RSpec.describe "GET /" do
  it "renders the React mount point" do
    get "/"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('id="root"')
  end

  it "injects credentials into window.ACME_CONFIG" do
    allow(AppConfig).to receive(:frontend_payload).and_return(
      apiUrl: "https://api.example.com",
      mapsBrowserKey: "maps-key"
    )

    get "/"

    expect(response.body).to include("window.ACME_CONFIG")
    expect(response.body).to include("https://api.example.com")
  end

  it "renders auth paths for the SPA" do
    get "/sign_in"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('id="root"')
  end

  it "renders the sign-out path for the SPA" do
    get "/sign_out"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('id="root"')
  end

  it "renders the employees path for the SPA" do
    get "/employees"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('id="root"')
  end

  it "renders an employee profile path for the SPA" do
    get "/employees/#{SecureRandom.uuid}"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('id="root"')
  end

  it "renders unknown SPA paths so the client can show 404" do
    get "/missing-route"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('id="root"')
  end
end
