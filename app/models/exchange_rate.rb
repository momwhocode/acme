# == Schema Information
#
# Table name: exchange_rates
#
#  id             :uuid             not null, primary key
#  effective_date :date             not null
#  from_currency  :string(3)        not null
#  rate           :decimal(18, 8)   not null
#  to_currency    :string(3)        not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_exchange_rates_on_currencies_and_effective_date  (from_currency,to_currency,effective_date) UNIQUE
#
class ExchangeRate < ApplicationRecord
  QUOTE_CURRENCIES = %w[EUR GBP INR].freeze

  # Current snapshot for first-time seed. Live updates append new dated rows — do not edit these rates.
  SEED_RATES = [
    { from_currency: "USD", to_currency: "USD", rate: "1.0" },
    { from_currency: "EUR", to_currency: "USD", rate: "1.10" },
    { from_currency: "GBP", to_currency: "USD", rate: "1.25" },
    { from_currency: "INR", to_currency: "USD", rate: "0.012" }
  ].freeze

  validates :from_currency, :to_currency, presence: true, length: { is: 3 }
  validates :rate, presence: true, numericality: { greater_than: 0 }
  validates :effective_date, presence: true
  validates :from_currency, uniqueness: { scope: %i[to_currency effective_date] }

  before_validation :normalize_currencies

  def self.seed!(on: Date.current)
    SEED_RATES.each do |attrs|
      upsert_quote!(
        from_currency: attrs[:from_currency],
        to_currency: attrs[:to_currency],
        rate: attrs[:rate],
        effective_date: on
      )
    end
  end

  # Writes a snapshot for `on`. Older rows stay so historical as_of lookups keep working.
  def self.sync!(quotes, on: Date.current)
    quotes.each do |quote|
      upsert_quote!(
        from_currency: quote.fetch(:from_currency),
        to_currency: quote.fetch(:to_currency),
        rate: quote.fetch(:rate),
        effective_date: on
      )
    end
  end

  def self.upsert_quote!(from_currency:, to_currency:, rate:, effective_date:)
    record = find_or_initialize_by(
      from_currency: from_currency.to_s.upcase.presence,
      to_currency: to_currency.to_s.upcase.presence,
      effective_date: effective_date
    )
    record.rate = rate
    record.save!
    record
  end

  def self.rate_to(from:, to:, on:)
    on = on.respond_to?(:to_date) ? on.to_date : on
    where(from_currency: from.to_s.upcase, to_currency: to.to_s.upcase)
      .where(effective_date: ..on)
      .order(effective_date: :desc)
      .pick(:rate)
  end

  private

  def normalize_currencies
    self.from_currency = from_currency.to_s.upcase.presence
    self.to_currency = to_currency.to_s.upcase.presence
  end
end
