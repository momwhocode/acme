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
require "rails_helper"

RSpec.describe ExchangeRate do
  include ActiveSupport::Testing::TimeHelpers

  def build_rate(**attrs)
    described_class.new({
      from_currency: "EUR",
      to_currency: "USD",
      rate: "1.1",
      effective_date: Date.new(2026, 1, 1)
    }.merge(attrs))
  end

  describe "validations" do
    it "accepts a complete quote" do
      expect(build_rate).to be_valid
    end

    it "requires from_currency" do
      expect(build_rate(from_currency: nil)).not_to be_valid
    end

    it "requires to_currency" do
      expect(build_rate(to_currency: nil)).not_to be_valid
    end

    it "requires a 3-letter from_currency" do
      expect(build_rate(from_currency: "EU")).not_to be_valid
    end

    it "requires a 3-letter to_currency" do
      expect(build_rate(to_currency: "USDO")).not_to be_valid
    end

    it "requires rate" do
      expect(build_rate(rate: nil)).not_to be_valid
    end

    it "rejects a zero rate" do
      expect(build_rate(rate: 0)).not_to be_valid
    end

    it "rejects a negative rate" do
      expect(build_rate(rate: -1)).not_to be_valid
    end

    it "requires effective_date" do
      expect(build_rate(effective_date: nil)).not_to be_valid
    end

    it "rejects a duplicate pair on the same date" do
      described_class.seed!
      duplicate = build_rate(effective_date: Date.current)

      expect(duplicate).not_to be_valid
    end
  end

  describe "normalize_currencies" do
    it "upcases currency codes before validation" do
      record = build_rate(from_currency: "eur", to_currency: "usd")
      record.validate

      expect(record.from_currency).to eq("EUR")
      expect(record.to_currency).to eq("USD")
    end
  end

  describe ".seed!" do
    it "inserts every catalog row" do
      described_class.seed!

      expect(described_class.count).to eq(described_class::SEED_RATES.size)
    end

    it "is idempotent" do
      described_class.seed!

      expect { described_class.seed! }.not_to change(described_class, :count)
    end

    it "restores catalog rates for the seed date" do
      described_class.seed!
      described_class.upsert_quote!(
        from_currency: "EUR", to_currency: "USD", rate: "9.99", effective_date: Date.current
      )
      described_class.seed!

      expect(described_class.rate_to(from: "EUR", to: "USD", on: Date.current)).to eq(BigDecimal("1.10"))
    end

    it "writes the snapshot as of Date.current" do
      described_class.seed!

      expect(described_class.exists?(from_currency: "EUR", effective_date: Date.current)).to be(true)
    end
  end

  describe ".upsert_quote!" do
    it "creates a persisted row" do
      record = described_class.upsert_quote!(
        from_currency: "JPY", to_currency: "USD", rate: "0.007", effective_date: Date.new(2026, 1, 1)
      )

      expect(record).to be_persisted
      expect(record.rate).to eq(BigDecimal("0.007"))
    end

    it "overwrites the rate on the same date" do
      date = Date.new(2026, 1, 1)
      described_class.upsert_quote!(from_currency: "EUR", to_currency: "USD", rate: "1.10", effective_date: date)
      described_class.upsert_quote!(from_currency: "EUR", to_currency: "USD", rate: "1.22", effective_date: date)

      expect(described_class.rate_to(from: "EUR", to: "USD", on: date)).to eq(BigDecimal("1.22"))
    end

    it "finds an existing row when the incoming codes are lowercase" do
      date = Date.new(2026, 1, 1)
      described_class.upsert_quote!(from_currency: "EUR", to_currency: "USD", rate: "1.10", effective_date: date)
      described_class.upsert_quote!(from_currency: "eur", to_currency: "usd", rate: "1.22", effective_date: date)

      expect(described_class.where(from_currency: "EUR", effective_date: date).count).to eq(1)
      expect(described_class.rate_to(from: "EUR", to: "USD", on: date)).to eq(BigDecimal("1.22"))
    end
  end

  describe ".sync!" do
    it "writes every quote for the given date" do
      described_class.sync!(
        [ { from_currency: "EUR", to_currency: "USD", rate: "1.3" } ],
        on: Date.new(2026, 5, 1)
      )

      expect(described_class.rate_to(from: "EUR", to: "USD", on: Date.new(2026, 5, 1))).to eq(BigDecimal("1.3"))
    end

    it "defaults on to Date.current" do
      travel_to Date.new(2026, 6, 1) do
        described_class.sync!([ { from_currency: "EUR", to_currency: "USD", rate: "1.4" } ])

        expect(described_class.exists?(from_currency: "EUR", effective_date: Date.new(2026, 6, 1))).to be(true)
      end
    end

    it "leaves older snapshots in place" do
      described_class.seed!
      described_class.sync!(
        [ { from_currency: "EUR", to_currency: "USD", rate: "1.3" } ],
        on: Date.current + 1
      )

      expect(described_class.rate_to(from: "EUR", to: "USD", on: Date.current)).to eq(BigDecimal("1.10"))
    end

    it "raises when a quote is missing a required key" do
      expect {
        described_class.sync!([ { to_currency: "USD", rate: "1.3" } ], on: Date.new(2026, 5, 1))
      }.to raise_error(KeyError)
    end
  end

  describe ".rate_to" do
    before { described_class.seed! }

    it "is case insensitive" do
      expect(described_class.rate_to(from: "eur", to: "usd", on: Date.current)).to eq(BigDecimal("1.10"))
    end

    it "returns the latest row on or before on" do
      described_class.upsert_quote!(
        from_currency: "EUR", to_currency: "USD", rate: "1.05", effective_date: Date.current - 30
      )

      expect(described_class.rate_to(from: "EUR", to: "USD", on: Date.current - 1)).to eq(BigDecimal("1.05"))
    end

    it "includes a row whose effective_date equals on" do
      expect(described_class.rate_to(from: "EUR", to: "USD", on: Date.current)).to eq(BigDecimal("1.10"))
    end

    it "returns nil when no row exists on or before on" do
      expect(described_class.rate_to(from: "GBP", to: "USD", on: Date.new(2019, 1, 1))).to be_nil
    end

    it "returns nil for an unknown pair" do
      expect(described_class.rate_to(from: "JPY", to: "USD", on: Date.current)).to be_nil
    end

    it "returns nil for a non-USD quote pair" do
      expect(described_class.rate_to(from: "EUR", to: "GBP", on: Date.current)).to be_nil
    end

    it "coerces a Time on to a date" do
      expect(
        described_class.rate_to(
          from: "EUR",
          to: "USD",
          on: Time.utc(Date.current.year, Date.current.month, Date.current.day, 15, 0, 0)
        )
      ).to eq(BigDecimal("1.10"))
    end
  end
end
