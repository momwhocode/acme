module Fx
  # Current catalog used by tests, seeds, and `fx:sync` when FX_SOURCE is not live.
  class SeedSource
    def fetch(on:)
      QuoteSnapshot.new(on: on, quotes: ExchangeRate::SEED_RATES.map { |attrs|
        {
          from_currency: attrs[:from_currency],
          to_currency: attrs[:to_currency],
          rate: attrs[:rate]
        }
      })
    end
  end
end
