require "rails_helper"

RSpec.describe SyncExchangeRatesJob do
  include ActiveSupport::Testing::TimeHelpers

  before { ExchangeRate.seed! }

  def snapshot(on, quotes)
    Fx::QuoteSnapshot.new(on: on, quotes: quotes)
  end

  it "writes the snapshot through Fx::Sync" do
    source = instance_double(
      Fx::SeedSource,
      fetch: snapshot(Date.new(2026, 2, 1), [ { from_currency: "INR", to_currency: "USD", rate: "0.011" } ])
    )

    described_class.perform_now(Date.new(2026, 2, 1), source: source)

    expect(ExchangeRate.rate_to(from: "INR", to: "USD", on: Date.new(2026, 2, 1))).to eq(BigDecimal("0.011"))
  end

  it "returns the number of quotes synced" do
    source = instance_double(
      Fx::SeedSource,
      fetch: snapshot(Date.new(2026, 2, 1), [ { from_currency: "INR", to_currency: "USD", rate: "0.011" } ])
    )

    expect(described_class.perform_now(Date.new(2026, 2, 1), source: source)).to eq(1)
  end

  it "defaults on to Date.current" do
    source = instance_double(
      Fx::SeedSource,
      fetch: snapshot(Date.new(2026, 8, 1), [ { from_currency: "INR", to_currency: "USD", rate: "0.011" } ])
    )

    travel_to Date.new(2026, 8, 1) do
      described_class.perform_now(source: source)

      expect(ExchangeRate.rate_to(from: "INR", to: "USD", on: Date.new(2026, 8, 1))).to eq(BigDecimal("0.011"))
    end
  end

  it "defaults source to the seed catalog" do
    described_class.perform_now(Date.new(2026, 4, 1))

    expect(ExchangeRate.rate_to(from: "EUR", to: "USD", on: Date.new(2026, 4, 1))).to eq(BigDecimal("1.10"))
  end

  it "queues on the default queue" do
    expect(described_class.new.queue_name).to eq("default")
  end
end
