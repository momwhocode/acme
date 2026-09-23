# == Schema Information
#
# Table name: pay_bands
#
#  id         :uuid             not null, primary key
#  currency   :string(3)        not null
#  level      :string           not null
#  midpoint   :decimal(15, 2)   not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pay_bands_on_level_and_currency  (level,currency) UNIQUE
#
require "rails_helper"

RSpec.describe PayBand do
  it "finds a band by level and currency" do
    band = create(:pay_band, level: "IC3", currency: "GBP", midpoint: 88_000)

    expect(described_class.for(level: "IC3", currency: "gbp")).to eq(band)
    expect(described_class.for(level: "IC9", currency: "GBP")).to be_nil
  end

  it "rejects a non-positive midpoint" do
    expect(build(:pay_band, midpoint: 0)).not_to be_valid
  end

  it "seeds USD midpoints and FX-converted local bands" do
    ExchangeRate.seed!(on: Date.current)

    described_class.seed!

    expect(described_class.for(level: "IC2", currency: "USD").midpoint).to eq(85_000)
    expect(described_class.for(level: "IC2", currency: "GBP").midpoint).to eq((85_000 / 1.25).round(2))
  end
end
