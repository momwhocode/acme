# Domain error mapped to 422 invalid_request. FX/seed errors stay outside this tree.
# Copy lives in config/locales/en.yml — raise AppError.t(:key) so API messages stay consistent.

class AppError < StandardError
  def self.t(key, **opts)
    new(I18n.t("errors.#{key}", **opts))
  end
end
