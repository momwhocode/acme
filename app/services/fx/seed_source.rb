module Fx
  # Deterministic catalog used by tests, seeds, and `fx:sync` when FX_SOURCE is not live.
  class SeedSource
    def fetch(on:)
      QuoteSnapshot.new(on: on, quotes: latest_by_pair(on).map { |(from, to), attrs|
        {
          from_currency: from,
          to_currency: to,
          rate: attrs[:rate]
        }
      })
    end

    private

    def latest_by_pair(on)
      ExchangeRate::SEED_RATES
        .select { |attrs| attrs[:effective_date] <= on }
        .group_by { |attrs| [ attrs[:from_currency], attrs[:to_currency] ] }
        .transform_values { |rows| rows.max_by { |attrs| attrs[:effective_date] } }
    end
  end
end
