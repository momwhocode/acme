class SyncExchangeRatesJob < ApplicationJob
  queue_as :default

  def perform(on = Date.current, source: Fx::Sync.default_source)
    Fx::Sync.call(on: on, source: source)
  end
end
