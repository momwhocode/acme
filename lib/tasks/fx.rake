namespace :fx do
  desc "Write a dated FX snapshot. FX_SOURCE=live uses Frankfurter/ECB; otherwise the seed catalog."
  task sync: :environment do
    on = ENV["FX_ON"].present? ? Date.iso8601(ENV["FX_ON"]) : Date.current
    count = SyncExchangeRatesJob.perform_now(on)
    puts "Synced #{count} exchange rates for #{on} (source=#{ENV.fetch('FX_SOURCE', 'seed')})."
  end
end
