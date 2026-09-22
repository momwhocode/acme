module Fx
  # Appends a dated FX snapshot. CurrencyNormalizer keeps using the table.
  class Sync
    class Error < StandardError; end

    def self.call(on: Date.current, source: default_source)
      snapshot = wrap(source.fetch(on: on), fallback_on: on)
      raise Error, "FX source returned no quotes for #{snapshot.on}." if snapshot.quotes.blank?

      ExchangeRate.sync!(snapshot.quotes, on: snapshot.on)
      snapshot.quotes.size
    end

    def self.default_source
      ENV["FX_SOURCE"] == "live" ? FrankfurterSource.new : SeedSource.new
    end

    def self.wrap(result, fallback_on:)
      return result if result.is_a?(QuoteSnapshot)

      QuoteSnapshot.new(on: fallback_on, quotes: Array(result))
    end
    private_class_method :wrap
  end
end
