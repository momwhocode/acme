# Compa-ratio against the seeded midpoint for this level and currency.

class PayBandLookup
  def self.call(employee:, compensation:, normalizer: CurrencyNormalizer.new)
    # No band when level or current pay is missing — profile still renders without compa.
    return if employee&.level.blank? || compensation.blank?

    band = PayBand.for(level: employee.level, currency: compensation.currency)
    return unless band

    local = normalizer.annualised_local(
      amount: compensation.base_amount,
      pay_period: compensation.pay_period,
      hours_per_week: compensation.hours_per_week
    )
    {
      level: band.level,
      currency: band.currency,
      midpoint: band.midpoint,
      compa_ratio: (local / band.midpoint).round(2)
    }
  rescue CurrencyNormalizer::Error
    { level: band.level, currency: band.currency, midpoint: band.midpoint, compa_ratio: nil }
  end
end
