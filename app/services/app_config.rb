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

    def api_url
      string(:api, :url).sub(%r{/\z}, "")
    end

    # Browser-safe slice injected as window.ACME_CONFIG.
    def frontend_payload
      { apiUrl: api_url }
    end

    private

    def string(*keys)
      Rails.application.credentials.dig(*keys).to_s.strip
    rescue ActiveSupport::EncryptedFile::MissingKeyError, ActiveSupport::MessageEncryptor::InvalidMessage
      ""
    end
  end
end
