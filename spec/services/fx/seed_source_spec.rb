require "rails_helper"

RSpec.describe Fx::SeedSource do
  subject(:source) { described_class.new }

  def quote_for(snapshot, code)
    snapshot.quotes.find { |quote| quote[:from_currency] == code }
  end

  it "returns a snapshot stamped with the requested date" do
    snapshot = source.fetch(on: Date.new(2024, 6, 1))

    expect(snapshot).to be_a(Fx::QuoteSnapshot)
    expect(snapshot.on).to eq(Date.new(2024, 6, 1))
  end

  it "uses the 2024 EUR rate on or after that date" do
    expect(quote_for(source.fetch(on: Date.new(2024, 1, 1)), "EUR").fetch(:rate)).to eq("1.10")
  end

  it "uses the 2020 EUR rate before 2024" do
    expect(quote_for(source.fetch(on: Date.new(2023, 12, 31)), "EUR").fetch(:rate)).to eq("1.05")
  end

  it "returns no quotes before the catalog starts" do
    expect(source.fetch(on: Date.new(2019, 12, 31)).quotes).to eq([])
  end

  it "includes the identity USD quote after 2020" do
    expect(quote_for(source.fetch(on: Date.new(2020, 1, 1)), "USD").fetch(:rate)).to eq("1.0")
  end

  it "includes GBP and INR after 2024" do
    codes = source.fetch(on: Date.new(2024, 6, 1)).quotes.map { |quote| quote[:from_currency] }

    expect(codes).to include("GBP", "INR")
  end

  it "omits GBP before its catalog date" do
    codes = source.fetch(on: Date.new(2020, 6, 1)).quotes.map { |quote| quote[:from_currency] }

    expect(codes).to include("USD", "EUR")
    expect(codes).not_to include("GBP")
  end
end
