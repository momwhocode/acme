require "rails_helper"

RSpec.describe Fx::QuoteSnapshot do
  it "holds the dated quote bag from an FX source" do
    snapshot = described_class.new(on: Date.new(2026, 9, 1), quotes: [ { from_currency: "GBP", to_currency: "USD", rate: "1.25" } ])

    expect(snapshot.on).to eq(Date.new(2026, 9, 1))
    expect(snapshot.quotes.first[:from_currency]).to eq("GBP")
  end
end
