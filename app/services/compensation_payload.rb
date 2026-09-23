# Compensation API row plus annualised USD when an as_of FX quote exists.

class CompensationPayload
  def self.call(record, normalizer: CurrencyNormalizer.new)
    return if record.blank?

    record.as_api_json.merge(annualised_usd: usd(record, normalizer))
  end

  def self.usd(record, normalizer)
    normalizer.annualised_usd(
      amount: record.base_amount,
      currency: record.currency,
      pay_period: record.pay_period,
      hours_per_week: record.hours_per_week,
      as_of: record.effective_date
    )
  rescue CurrencyNormalizer::Error
    nil
  end
  private_class_method :usd
end
