require "rails_helper"

RSpec.describe Fx::SeedSource do
  subject(:source) { described_class.new }

  def quote_for(snapshot, code)
    snapshot.quotes.find { |quote| quote[:from_currency] == code }
  end

  it "returns a snapshot stamped with the requested date" do
    snapshot = source.fetch(on: Date.current)

    expect(snapshot).to be_a(Fx::QuoteSnapshot)
    expect(snapshot.on).to eq(Date.current)
  end

  it "returns the current EUR rate" do
    expect(quote_for(source.fetch(on: Date.current), "EUR").fetch(:rate)).to eq("1.10")
  end

  it "includes the identity USD quote" do
    expect(quote_for(source.fetch(on: Date.current), "USD").fetch(:rate)).to eq("1.0")
  end

  it "includes GBP and INR" do
    codes = source.fetch(on: Date.current).quotes.map { |quote| quote[:from_currency] }

    expect(codes).to include("GBP", "INR")
  end

  it "returns the same current catalog for a historical request date" do
    expect(quote_for(source.fetch(on: Date.new(2019, 1, 1)), "EUR").fetch(:rate)).to eq("1.10")
  end
end
