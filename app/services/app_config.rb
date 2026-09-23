# Encrypted credentials for the whole app. Call sites never read ENV for product config.
class AppConfig
  class << self
    def hr_email
      string(:hr, :email).presence
    end

    def hr_password
      string(:hr, :password).presence
    end

    def fx_source
      string(:fx, :source).presence || "seed"
    end

    def fx_live?
      fx_source == "live"
    end

    def database_password
      string(:database, :password).presence
    end

    def redis_url
      string(:redis, :url).presence || "redis://localhost:6379/1"
    end

    def google_maps_browser_key
      string(:google_maps, :browser_key).presence.to_s
    end

    def api_url
      string(:api, :url).sub(%r{/\z}, "")
    end

    # Browser-safe slice injected as window.ACME_CONFIG. Maps key is referrer-restricted.
    def frontend_payload
      { apiUrl: api_url, mapsBrowserKey: google_maps_browser_key }
    end

    private

    def string(*keys)
      Rails.application.credentials.dig(*keys).to_s.strip
    rescue ActiveSupport::EncryptedFile::MissingKeyError, ActiveSupport::MessageEncryptor::InvalidMessage
      ""
    end
  end
end
