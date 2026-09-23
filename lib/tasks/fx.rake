namespace :fx do
  desc "Write a dated FX snapshot. Source is credentials fx.source. Optional date: bin/rails \"fx:sync[2024-06-01]\""
  task :sync, [ :on ] => :environment do |_task, args|
    on = args[:on].present? ? Date.iso8601(args[:on]) : Date.current
    count = SyncExchangeRatesJob.perform_now(on)
    puts "Synced #{count} exchange rates for #{on} (source=#{AppConfig.fx_source})."
  end
end
