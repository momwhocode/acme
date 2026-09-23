# Annualise local pay and convert to USD using the latest FX row on or before as_of.

class CurrencyNormalizer
  BASE_CURRENCY = "USD"
  WEEKS_PER_YEAR = 52
  MONTHS_PER_YEAR = 12
  # 5-day week, 52 weeks. Product rule for daily contractor/freelancer rates.
  WORKING_DAYS_PER_YEAR = 5 * WEEKS_PER_YEAR

  class Error < StandardError; end
  class MissingRateError < Error; end
  class UnknownPayPeriodError < Error; end
  class InvalidAmountError < Error; end
  class InvalidHoursError < Error; end

  def initialize(rates: ExchangeRate)
    @rates = rates
  end

  def annualised_usd(amount:, currency:, pay_period:, hours_per_week: nil, as_of: Date.current)
    annual_local = annualise(
      parse_amount(amount),
      pay_period,
      hours_per_week
    )

    (annual_local * fx_rate(currency, as_of)).round(2)
  end

  def annualised_local(amount:, pay_period:, hours_per_week: nil)
    annualise(parse_amount(amount), pay_period, hours_per_week).round(2)
  end

  private

  def parse_amount(amount)
    raise InvalidAmountError, I18n.t("errors.amount_required") if amount.nil? || amount.to_s.strip.empty?

    value = BigDecimal(amount.to_s)
    raise InvalidAmountError, I18n.t("errors.amount_negative") if value.negative?

    value
  rescue ArgumentError
    raise InvalidAmountError, I18n.t("errors.amount_numeric")
  end

  def annualise(amount, pay_period, hours_per_week)
    period = pay_period.to_s.strip.downcase
    raise UnknownPayPeriodError, I18n.t("errors.unknown_pay_period", period: pay_period.inspect) unless CompensationRecord::PAY_PERIODS.include?(period)

    case period
    when "annual" then amount
    when "monthly" then amount * MONTHS_PER_YEAR
    when "daily" then amount * WORKING_DAYS_PER_YEAR
    when "hourly"
      weekly_hours = parse_weekly_hours(hours_per_week)
      amount * weekly_hours * WEEKS_PER_YEAR
    end
  end

  def parse_weekly_hours(hours_per_week)
    raise InvalidHoursError, I18n.t("errors.hours_required") if hours_per_week.nil?

    hours = BigDecimal(hours_per_week.to_s)
    raise InvalidHoursError, I18n.t("errors.hours_positive") if hours <= 0

    hours
  rescue ArgumentError
    raise InvalidHoursError, I18n.t("errors.hours_numeric")
  end

  def fx_rate(currency, as_of)
    code = currency.to_s.strip.upcase
    raise MissingRateError, I18n.t("errors.currency_required") if code.blank?

    on = as_of.respond_to?(:to_date) ? as_of.to_date : as_of
    rate = @rates.rate_to(from: code, to: BASE_CURRENCY, on: on)
    raise MissingRateError, I18n.t("errors.missing_fx", from: code, to: BASE_CURRENCY, on: on) if rate.blank?

    BigDecimal(rate.to_s)
  end
end
