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
# Midpoint by level and currency. Seed converts USD bands through the current FX snapshot.

class PayBand < ApplicationRecord
  USD_MIDPOINTS = {
    "IC1" => 60_000,
    "IC2" => 85_000,
    "IC3" => 110_000,
    "IC4" => 140_000,
    "IC5" => 180_000,
    "M1" => 150_000,
    "M2" => 190_000,
    "M3" => 240_000
  }.freeze

  validates :level, presence: true
  validates :currency, presence: true, format: { with: /\A[A-Z]{3}\z/ }
  validates :midpoint, numericality: { greater_than: 0 }
  validates :level, uniqueness: { scope: :currency }

  def self.seed!
    ExchangeRate.supported_currencies.each do |currency|
      rate = ExchangeRate.rate_to(from: currency, to: "USD", on: Date.current) || 1
      USD_MIDPOINTS.each do |level, usd|
        midpoint = currency == "USD" ? usd : (usd / BigDecimal(rate.to_s)).round(2)
        find_or_initialize_by(level: level, currency: currency).update!(midpoint: midpoint)
      end
    end
  end

  def self.for(level:, currency:)
    find_by(level: level.to_s.strip, currency: currency.to_s.strip.upcase)
  end
end
