require "rails_helper"

RSpec.describe AppConfig do
  def stub_credentials(hash)
    allow(Rails.application.credentials).to receive(:dig) do |*keys|
      hash.dig(*keys)
    end
  end

  it "reads the HR seed account from credentials" do
    stub_credentials(hr: { email: "lead@acme.test", password: "supersecret" })

    expect(described_class.hr_email).to eq("lead@acme.test")
    expect(described_class.hr_password).to eq("supersecret")
  end

  it "treats a blank HR email as unset" do
    stub_credentials(hr: { email: "  ", password: "" })

    expect(described_class.hr_email).to be_nil
    expect(described_class.hr_password).to be_nil
  end

  it "treats a blank FX source as the seed catalog" do
    stub_credentials(fx: { source: " " })

    expect(described_class.fx_source).to eq("seed")
  end

  it "selects live FX only when credentials say live" do
    stub_credentials(fx: { source: "live" })

    expect(described_class.fx_source).to eq("live")
    expect(described_class).to be_fx_live
  end

  it "defaults FX to the seed catalog" do
    stub_credentials({})

    expect(described_class.fx_source).to eq("seed")
    expect(described_class).not_to be_fx_live
  end

  it "defaults force_ssl to off so the IP deploy can serve HTTP" do
    stub_credentials({})

    expect(described_class).not_to be_force_ssl
  end

  it "turns force_ssl on from credentials" do
    stub_credentials(force_ssl: true)

    expect(described_class).to be_force_ssl
  end

  it "strips a trailing slash from the API URL" do
    stub_credentials(api: { url: "https://api.example.com/" })

    expect(described_class.api_url).to eq("https://api.example.com")
  end

  it "exposes the browser-safe frontend payload" do
    stub_credentials(api: { url: "https://api.example.com" }, google_maps: { browser_key: "maps-key" })

    expect(described_class.frontend_payload).to eq(
      apiUrl: "https://api.example.com",
      mapsBrowserKey: "maps-key"
    )
  end

  it "defaults FX when the master key is missing" do
    allow(Rails.application.credentials).to receive(:dig).and_raise(
      ActiveSupport::EncryptedFile::MissingKeyError.new(key_path: "config/master.key", env_key: "RAILS_MASTER_KEY")
    )

    expect(described_class.fx_source).to eq("seed")
    expect(described_class.hr_email).to be_nil
  end

  it "defaults the frontend payload when the master key is missing" do
    allow(Rails.application.credentials).to receive(:dig).and_raise(
      ActiveSupport::EncryptedFile::MissingKeyError.new(key_path: "config/master.key", env_key: "RAILS_MASTER_KEY")
    )

    expect(described_class.redis_url).to eq("redis://localhost:6379/1")
    expect(described_class.frontend_payload).to eq(apiUrl: "", mapsBrowserKey: "")
  end
end
