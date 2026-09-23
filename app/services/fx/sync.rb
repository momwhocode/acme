module Fx
  # Appends a dated FX snapshot. CurrencyNormalizer keeps using the table.
  class Sync
    class Error < StandardError; end

    def self.call(on: Date.current, source: default_source)
      snapshot = source.fetch(on: on)
      raise Error, "FX source returned no quotes for #{on}." unless snapshot.is_a?(QuoteSnapshot) && snapshot.quotes.present?

      ExchangeRate.sync!(snapshot.quotes, on: snapshot.on)
      snapshot.quotes.size
    end

    def self.default_source
      ENV["FX_SOURCE"] == "live" ? FrankfurterSource.new : SeedSource.new
    end
  end
end
