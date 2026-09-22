require "rails_helper"

RSpec.describe Fx::FrankfurterSource do
  def frankfurter_json(rates: default_rates, date: "2026-01-02")
    { "date" => date, "rates" => rates }.to_json
  end

  def default_rates
    { "EUR" => 0.80, "GBP" => 0.50, "INR" => 100 }
  end

  def fetch_json(body, on: Date.current)
    described_class.new(get: ->(_uri) { body }).fetch(on: on)
  end

  def indexed_quotes(snapshot)
    snapshot.quotes.index_by { |quote| quote[:from_currency] }
  end

  it "inverts USD quotes into *→USD rates and uses the provider date" do
    snapshot = fetch_json(frankfurter_json, on: Date.new(2026, 1, 3))

    expect(snapshot.on).to eq(Date.new(2026, 1, 2))
    expect(indexed_quotes(snapshot).fetch("EUR").fetch(:rate)).to eq("1.25")
  end

  it "includes a USD identity quote" do
    usd = indexed_quotes(fetch_json(frankfurter_json)).fetch("USD")

    expect(usd.fetch(:to_currency)).to eq("USD")
    expect(usd.fetch(:rate)).to eq("1.0")
  end

  it "inverts GBP when USD per GBP is 0.50" do
    expect(indexed_quotes(fetch_json(frankfurter_json)).fetch("GBP").fetch(:rate)).to eq("2.0")
  end

  it "inverts INR when USD per INR is 100" do
    expect(indexed_quotes(fetch_json(frankfurter_json)).fetch("INR").fetch(:rate)).to eq("0.01")
  end

  it "raises when the payload is missing a currency" do
    expect {
      fetch_json({ "date" => "2026-01-02", "rates" => { "EUR" => 0.80 } }.to_json)
    }.to raise_error(Fx::FrankfurterSource::Error, /GBP/)
  end

  it "raises when a quoted rate is zero" do
    expect {
      fetch_json(frankfurter_json(rates: default_rates.merge("GBP" => 0)))
    }.to raise_error(Fx::FrankfurterSource::Error, /non-positive GBP/)
  end

  it "raises when a quoted rate is negative" do
    expect {
      fetch_json(frankfurter_json(rates: default_rates.merge("INR" => -1)))
    }.to raise_error(Fx::FrankfurterSource::Error, /non-positive INR/)
  end

  it "raises when a quoted rate is blank" do
    rates = default_rates.merge("INR" => nil)

    expect {
      fetch_json(frankfurter_json(rates: rates))
    }.to raise_error(Fx::FrankfurterSource::Error, /INR/)
  end

  it "raises when the payload is not JSON" do
    expect {
      fetch_json("not-json")
    }.to raise_error(Fx::FrankfurterSource::Error, /invalid/)
  end

  it "raises when the date is missing" do
    expect {
      fetch_json({ "rates" => default_rates }.to_json)
    }.to raise_error(Fx::FrankfurterSource::Error, /invalid/)
  end

  it "raises when rates are missing" do
    expect {
      fetch_json({ "date" => "2026-01-02" }.to_json)
    }.to raise_error(Fx::FrankfurterSource::Error, /invalid/)
  end

  it "raises when the date is invalid" do
    expect {
      fetch_json(frankfurter_json(date: "not-a-date"))
    }.to raise_error(Fx::FrankfurterSource::Error, /invalid/)
  end

  it "raises when rates is not a mapping" do
    expect {
      fetch_json({ "date" => "2026-01-02", "rates" => 1 }.to_json)
    }.to raise_error(Fx::FrankfurterSource::Error, /invalid/)
  end

  it "requests a historical URI before Date.current" do
    seen = nil
    get = lambda { |uri|
      seen = uri
      frankfurter_json
    }

    described_class.new(get: get).fetch(on: Date.new(2020, 1, 1))

    expect(seen.to_s).to include("#{described_class::ENDPOINT}/2020-01-01")
    expect(seen.to_s).to include("from=USD")
  end

  it "requests latest on Date.current" do
    seen = nil
    get = lambda { |uri|
      seen = uri
      frankfurter_json
    }

    described_class.new(get: get).fetch(on: Date.current)

    expect(seen.to_s).to include("#{described_class::ENDPOINT}/latest")
  end

  it "requests latest for a future date" do
    seen = nil
    get = lambda { |uri|
      seen = uri
      frankfurter_json
    }

    described_class.new(get: get).fetch(on: Date.current + 1)

    expect(seen.to_s).to include("/latest")
  end

  it "asks Frankfurter for EUR, GBP, and INR" do
    seen = nil
    get = lambda { |uri|
      seen = uri
      frankfurter_json
    }

    described_class.new(get: get).fetch(on: Date.current)

    expect(seen.query).to include("to=EUR,GBP,INR")
  end

  it "raises when the HTTP response is not successful" do
    response = Net::HTTPServiceUnavailable.new("1.1", "503", "Unavailable")
    allow(Net::HTTP).to receive(:get_response).and_return(response)

    expect {
      described_class.new.fetch(on: Date.current)
    }.to raise_error(Fx::FrankfurterSource::Error, /HTTP 503/)
  end
end
