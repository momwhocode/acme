require "json"
require "net/http"
require "bigdecimal"

module Fx
  # ECB rates via Frankfurter. No API key. Isolated so tests never hit the network.
  class FrankfurterSource
    ENDPOINT = "https://api.frankfurter.app"

    class Error < StandardError; end

    def initialize(get: method(:http_get))
      @get = get
    end

    def fetch(on:)
      payload = JSON.parse(@get.call(uri_for(on)))
      usd_rates = payload.fetch("rates")
      quoted_on = Date.iso8601(payload.fetch("date"))

      quotes = [ { from_currency: "USD", to_currency: "USD", rate: "1.0" } ]
      ExchangeRate::QUOTE_CURRENCIES.each do |code|
        usd_per_unit = usd_rates[code]
        raise Error, "Frankfurter omitted #{code}." if usd_per_unit.blank?

        unit = BigDecimal(usd_per_unit.to_s)
        raise Error, "Frankfurter returned a non-positive #{code} rate." unless unit.positive?

        # Frankfurter quotes USD-per-unit; we store unit→USD so CurrencyNormalizer can multiply.
        quotes << {
          from_currency: code,
          to_currency: "USD",
          rate: (BigDecimal("1") / unit).to_s("F")
        }
      end

      QuoteSnapshot.new(on: quoted_on, quotes: quotes)
    rescue JSON::ParserError, KeyError, TypeError, Date::Error => error
      raise Error, "Frankfurter response was invalid: #{error.message}"
    end

    private

    def uri_for(on)
      date = on < Date.current ? on.iso8601 : "latest"
      URI("#{ENDPOINT}/#{date}?from=USD&to=#{ExchangeRate::QUOTE_CURRENCIES.join(',')}")
    end

    def http_get(uri)
      response = Net::HTTP.get_response(uri)
      raise Error, "Frankfurter returned HTTP #{response.code}." unless response.is_a?(Net::HTTPSuccess)

      response.body
    end
  end
end
