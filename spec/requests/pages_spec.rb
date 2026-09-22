require "rails_helper"

RSpec.describe "GET /" do
  it "renders the React mount point" do
    get "/"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('id="root"')
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
end
