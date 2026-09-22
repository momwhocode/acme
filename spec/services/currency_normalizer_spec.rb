require "rails_helper"

RSpec.describe CurrencyNormalizer do
  include ActiveSupport::Testing::TimeHelpers

  subject(:normalizer) { described_class.new }

  before { ExchangeRate.seed! }

  def annualised(**overrides)
    normalizer.annualised_usd(**{
      amount: 10_000,
      currency: "USD",
      pay_period: "annual"
    }.merge(overrides))
  end

  describe "constants" do
    it "treats USD as the reporting currency" do
      expect(described_class::BASE_CURRENCY).to eq("USD")
    end

    it "defines 260 working days per year" do
      expect(described_class::WORKING_DAYS_PER_YEAR).to eq(260)
    end
  end

  describe "#annualised_usd" do
    it "leaves USD annual pay unchanged" do
      expect(annualised(amount: 80_000)).to eq(BigDecimal("80000.00"))
    end

    it "accepts a string amount" do
      expect(annualised(amount: "80000")).to eq(BigDecimal("80000.00"))
    end

    it "accepts a BigDecimal amount" do
      expect(annualised(amount: BigDecimal("80000"))).to eq(BigDecimal("80000.00"))
    end

    it "converts EUR annual pay with the seeded 2024 rate" do
      expect(
        annualised(amount: 100_000, currency: "EUR", as_of: Date.new(2024, 6, 1))
      ).to eq(BigDecimal("110000.00"))
    end

    it "converts GBP monthly pay to annual USD" do
      expect(annualised(amount: 5_000, currency: "GBP", pay_period: "monthly")).to eq(BigDecimal("75000.00"))
    end

    it "converts INR monthly pay to annual USD" do
      expect(annualised(amount: 100_000, currency: "INR", pay_period: "monthly")).to eq(BigDecimal("14400.00"))
    end

    it "converts INR hourly pay using hours_per_week" do
      expect(
        annualised(amount: 2_000, currency: "INR", pay_period: "hourly", hours_per_week: 20)
      ).to eq(BigDecimal("24960.00"))
    end

    it "converts USD hourly pay" do
      expect(
        annualised(amount: 50, pay_period: "hourly", hours_per_week: 40)
      ).to eq(BigDecimal("104000.00"))
    end

    it "accepts hours_per_week as a string" do
      expect(
        annualised(amount: 50, pay_period: "hourly", hours_per_week: "40")
      ).to eq(BigDecimal("104000.00"))
    end

    it "accepts fractional weekly hours" do
      expect(
        annualised(amount: 50, pay_period: "hourly", hours_per_week: 20.5)
      ).to eq(BigDecimal("53300.00"))
    end

    it "annualises a daily rate over 260 working days" do
      expect(annualised(amount: 400, pay_period: "daily")).to eq(BigDecimal("104000.00"))
    end

    it "converts GBP daily pay to annual USD" do
      expect(
        annualised(amount: 400, currency: "GBP", pay_period: "daily")
      ).to eq(BigDecimal("130000.00"))
    end

    it "uses the latest seeded rate on or before as_of" do
      expect(
        annualised(amount: 100_000, currency: "EUR", as_of: Date.new(2021, 6, 1))
      ).to eq(BigDecimal("105000.00"))
    end

    it "defaults as_of to Date.current" do
      travel_to Date.new(2021, 6, 1) do
        expect(annualised(amount: 100_000, currency: "EUR")).to eq(BigDecimal("105000.00"))
      end
    end

    it "converts a Time as_of to a date" do
      expect(
        annualised(amount: 100_000, currency: "EUR", as_of: Time.utc(2021, 6, 1, 23, 0, 0))
      ).to eq(BigDecimal("105000.00"))
    end

    it "converts a DateTime as_of to a date" do
      expect(
        annualised(amount: 100_000, currency: "EUR", as_of: DateTime.new(2021, 6, 1, 23, 0, 0))
      ).to eq(BigDecimal("105000.00"))
    end

    it "parses an ISO8601 string as_of" do
      expect(
        annualised(amount: 100_000, currency: "EUR", as_of: "2021-06-01")
      ).to eq(BigDecimal("105000.00"))
    end

    it "normalises lowercase currency codes" do
      expect(annualised(amount: 10_000, currency: "gbp")).to eq(BigDecimal("12500.00"))
    end

    it "strips whitespace from currency codes" do
      expect(annualised(amount: 10_000, currency: " gbp ")).to eq(BigDecimal("12500.00"))
    end

    it "strips whitespace from pay periods" do
      expect(annualised(amount: 400, pay_period: " daily ")).to eq(BigDecimal("104000.00"))
    end

    it "accepts hours_per_week as a BigDecimal" do
      expect(
        annualised(amount: 50, pay_period: "hourly", hours_per_week: BigDecimal("40"))
      ).to eq(BigDecimal("104000.00"))
    end

    it "nests domain errors under Error" do
      expect(described_class::MissingRateError).to be < described_class::Error
      expect(described_class::InvalidHoursError).to be < described_class::Error
    end

    it "normalises symbol currency codes" do
      expect(annualised(amount: 10_000, currency: :eur, as_of: Date.new(2024, 6, 1))).to eq(BigDecimal("11000.00"))
    end

    it "normalises uppercase pay periods" do
      expect(annualised(amount: 5_000, currency: "GBP", pay_period: "MONTHLY")).to eq(BigDecimal("75000.00"))
    end

    it "accepts a symbol pay period" do
      expect(annualised(amount: 400, pay_period: :daily)).to eq(BigDecimal("104000.00"))
    end

    it "treats a zero amount as zero USD" do
      expect(annualised(amount: 0, currency: "EUR")).to eq(BigDecimal("0.00"))
    end

    it "uses an injected rates object" do
      rates = class_double(ExchangeRate, rate_to: BigDecimal("2"))
      result = described_class.new(rates: rates).annualised_usd(
        amount: 100, currency: "EUR", pay_period: "annual"
      )

      expect(result).to eq(BigDecimal("200.00"))
    end

    it "rounds converted USD to two decimals" do
      rates = class_double(ExchangeRate, rate_to: BigDecimal("1.111"))
      result = described_class.new(rates: rates).annualised_usd(
        amount: 100, currency: "EUR", pay_period: "annual"
      )

      expect(result).to eq(BigDecimal("111.10"))
    end

    it "raises when no rate exists for the currency" do
      expect { annualised(currency: "JPY") }.to raise_error(CurrencyNormalizer::MissingRateError, /JPY->USD/)
    end

    it "raises when as_of is before any seeded rate" do
      expect {
        annualised(currency: "GBP", as_of: Date.new(2019, 1, 1))
      }.to raise_error(CurrencyNormalizer::MissingRateError)
    end

    it "raises when currency is nil" do
      expect { annualised(currency: nil) }.to raise_error(CurrencyNormalizer::MissingRateError, /required/)
    end

    it "raises when currency is blank" do
      expect { annualised(currency: "  ") }.to raise_error(CurrencyNormalizer::MissingRateError, /required/)
    end

    it "raises for an unknown pay period" do
      expect { annualised(pay_period: "weekly") }.to raise_error(CurrencyNormalizer::UnknownPayPeriodError, /weekly/)
    end

    it "raises when pay period is nil" do
      expect { annualised(pay_period: nil) }.to raise_error(CurrencyNormalizer::UnknownPayPeriodError)
    end

    it "raises when hourly pay omits hours_per_week" do
      expect {
        annualised(amount: 50, pay_period: "hourly")
      }.to raise_error(CurrencyNormalizer::InvalidHoursError, /hours_per_week/)
    end

    it "raises when hours_per_week is zero" do
      expect {
        annualised(amount: 50, pay_period: "hourly", hours_per_week: 0)
      }.to raise_error(CurrencyNormalizer::InvalidHoursError, /greater than zero/)
    end

    it "raises when hours_per_week is negative" do
      expect {
        annualised(amount: 50, pay_period: "hourly", hours_per_week: -1)
      }.to raise_error(CurrencyNormalizer::InvalidHoursError, /greater than zero/)
    end

    it "raises when hours_per_week is not numeric" do
      expect {
        annualised(amount: 50, pay_period: "hourly", hours_per_week: "full-time")
      }.to raise_error(CurrencyNormalizer::InvalidHoursError, /numeric/)
    end

    it "raises when hours_per_week is blank" do
      expect {
        annualised(amount: 50, pay_period: "hourly", hours_per_week: "")
      }.to raise_error(CurrencyNormalizer::InvalidHoursError, /numeric/)
    end

    it "raises when the amount is negative" do
      expect { annualised(amount: -1) }.to raise_error(CurrencyNormalizer::InvalidAmountError, /zero or greater/)
    end

    it "raises when the amount is missing" do
      expect { annualised(amount: nil) }.to raise_error(CurrencyNormalizer::InvalidAmountError, /required/)
    end

    it "raises when the amount is blank" do
      expect { annualised(amount: "  ") }.to raise_error(CurrencyNormalizer::InvalidAmountError, /required/)
    end

    it "raises when the amount is not numeric" do
      expect { annualised(amount: "ten") }.to raise_error(CurrencyNormalizer::InvalidAmountError, /numeric/)
    end
  end
end
