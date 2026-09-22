require "rails_helper"

RSpec.describe Fx::Sync do
  include ActiveSupport::Testing::TimeHelpers

  before { ExchangeRate.seed! }

  def restore_fx_source(previous)
    if previous.nil?
      ENV.delete("FX_SOURCE")
    else
      ENV["FX_SOURCE"] = previous
    end
  end

  it "appends a new dated snapshot without changing older rates" do
    source = instance_double(
      Fx::SeedSource,
      fetch: [ { from_currency: "EUR", to_currency: "USD", rate: "1.20" } ]
    )

    described_class.call(on: Date.current + 1, source: source)

    expect(ExchangeRate.rate_to(from: "EUR", to: "USD", on: Date.current)).to eq(BigDecimal("1.10"))
    expect(ExchangeRate.rate_to(from: "EUR", to: "USD", on: Date.current + 1)).to eq(BigDecimal("1.20"))
  end

  it "uses the seed catalog when FX_SOURCE is not live" do
    described_class.call(on: Date.new(2026, 3, 1), source: Fx::SeedSource.new)

    expect(ExchangeRate.rate_to(from: "GBP", to: "USD", on: Date.new(2026, 3, 1))).to eq(BigDecimal("1.25"))
  end

  it "uses the snapshot date from the live source" do
    source = instance_double(
      Fx::FrankfurterSource,
      fetch: Fx::QuoteSnapshot.new(
        on: Date.new(2026, 1, 2),
        quotes: [ { from_currency: "EUR", to_currency: "USD", rate: "1.18" } ]
      )
    )

    described_class.call(on: Date.new(2026, 1, 3), source: source)

    expect(ExchangeRate.rate_to(from: "EUR", to: "USD", on: Date.new(2026, 1, 2))).to eq(BigDecimal("1.18"))
    expect(ExchangeRate.exists?(from_currency: "EUR", effective_date: Date.new(2026, 1, 3))).to be(false)
  end

  it "stamps a raw array with the requested on date" do
    source = instance_double(
      Fx::SeedSource,
      fetch: [ { from_currency: "EUR", to_currency: "USD", rate: "1.19" } ]
    )

    described_class.call(on: Date.new(2026, 4, 1), source: source)

    expect(ExchangeRate.exists?(from_currency: "EUR", effective_date: Date.new(2026, 4, 1))).to be(true)
  end

  it "returns the number of quotes written" do
    source = instance_double(
      Fx::SeedSource,
      fetch: [ { from_currency: "EUR", to_currency: "USD", rate: "1.20" } ]
    )

    expect(described_class.call(on: Date.new(2026, 1, 1), source: source)).to eq(1)
  end

  it "overwrites a snapshot on the same date" do
    first = instance_double(Fx::SeedSource, fetch: [ { from_currency: "EUR", to_currency: "USD", rate: "1.20" } ])
    second = instance_double(Fx::SeedSource, fetch: [ { from_currency: "EUR", to_currency: "USD", rate: "1.21" } ])

    described_class.call(on: Date.new(2026, 1, 1), source: first)
    described_class.call(on: Date.new(2026, 1, 1), source: second)

    expect(ExchangeRate.rate_to(from: "EUR", to: "USD", on: Date.new(2026, 1, 1))).to eq(BigDecimal("1.21"))
  end

  it "defaults on to Date.current" do
    source = instance_double(
      Fx::SeedSource,
      fetch: [ { from_currency: "EUR", to_currency: "USD", rate: "1.17" } ]
    )

    travel_to Date.new(2026, 7, 1) do
      described_class.call(source: source)

      expect(ExchangeRate.exists?(from_currency: "EUR", effective_date: Date.new(2026, 7, 1))).to be(true)
    end
  end

  it "raises when the source returns no quotes" do
    source = instance_double(Fx::SeedSource, fetch: [])

    expect {
      described_class.call(on: Date.new(2010, 1, 1), source: source)
    }.to raise_error(Fx::Sync::Error, /no quotes/)
  end

  it "raises when the source returns nil" do
    source = instance_double(Fx::SeedSource, fetch: nil)

    expect {
      described_class.call(on: Date.new(2010, 1, 1), source: source)
    }.to raise_error(Fx::Sync::Error, /no quotes/)
  end

  it "raises when a snapshot has blank quotes" do
    source = instance_double(
      Fx::SeedSource,
      fetch: Fx::QuoteSnapshot.new(on: Date.new(2010, 1, 1), quotes: [])
    )

    expect {
      described_class.call(on: Date.new(2010, 1, 1), source: source)
    }.to raise_error(Fx::Sync::Error, /no quotes/)
  end

  it "selects Frankfurter when FX_SOURCE is live" do
    previous = ENV["FX_SOURCE"]
    ENV["FX_SOURCE"] = "live"

    expect(described_class.default_source).to be_a(Fx::FrankfurterSource)
  ensure
    restore_fx_source(previous)
  end

  it "selects the seed catalog when FX_SOURCE is unset" do
    previous = ENV["FX_SOURCE"]
    ENV.delete("FX_SOURCE")

    expect(described_class.default_source).to be_a(Fx::SeedSource)
  ensure
    restore_fx_source(previous)
  end

  it "selects the seed catalog when FX_SOURCE is not exactly live" do
    previous = ENV["FX_SOURCE"]
    ENV["FX_SOURCE"] = "LIVE"

    expect(described_class.default_source).to be_a(Fx::SeedSource)
  ensure
    restore_fx_source(previous)
  end
end
