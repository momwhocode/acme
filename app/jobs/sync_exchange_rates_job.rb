# Nightly FX snapshot append. Home and pay USD use the latest rate on or before as_of.

class SyncExchangeRatesJob < ApplicationJob
  queue_as :default

  def perform(on = Date.current, source: Fx::Sync.default_source)
    Fx::Sync.call(on: on, source: source)
  end
end
