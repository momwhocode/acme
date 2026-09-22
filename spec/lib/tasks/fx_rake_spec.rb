require "rails_helper"
require "rake"

# Rake tasks have no class constant. This file covers lib/tasks/fx.rake.
# rubocop:disable RSpec/DescribeClass, RSpec/SpecFilePathFormat
RSpec.describe "fx:sync" do
  include ActiveSupport::Testing::TimeHelpers

  def restore_env(key, previous)
    if previous.nil?
      ENV.delete(key)
    else
      ENV[key] = previous
    end
  end

  before do
    Rails.application.load_tasks unless Rake::Task.task_defined?("fx:sync")
    Rake::Task["fx:sync"].reenable
  end

  it "passes FX_ON to the job and prints the count" do
    previous = ENV["FX_ON"]
    ENV["FX_ON"] = "2026-09-01"
    allow(SyncExchangeRatesJob).to receive(:perform_now).and_return(4)

    expect { Rake::Task["fx:sync"].invoke }.to output(/Synced 4 exchange rates for 2026-09-01/).to_stdout
    expect(SyncExchangeRatesJob).to have_received(:perform_now).with(Date.new(2026, 9, 1))
  ensure
    restore_env("FX_ON", previous)
  end

  it "defaults the snapshot date to Date.current" do
    previous = ENV["FX_ON"]
    ENV.delete("FX_ON")
    allow(SyncExchangeRatesJob).to receive(:perform_now).and_return(4)

    travel_to Date.new(2026, 9, 22) do
      expect { Rake::Task["fx:sync"].invoke }.to output(/for 2026-09-22/).to_stdout
      expect(SyncExchangeRatesJob).to have_received(:perform_now).with(Date.new(2026, 9, 22))
    end
  ensure
    restore_env("FX_ON", previous)
  end

  it "prints the configured source name" do
    previous = ENV["FX_SOURCE"]
    ENV["FX_SOURCE"] = "live"
    allow(SyncExchangeRatesJob).to receive(:perform_now).and_return(4)

    expect { Rake::Task["fx:sync"].invoke }.to output(/source=live/).to_stdout
  ensure
    restore_env("FX_SOURCE", previous)
  end

  it "raises when FX_ON is not ISO8601" do
    previous = ENV["FX_ON"]
    ENV["FX_ON"] = "tomorrow"

    expect { Rake::Task["fx:sync"].invoke }.to raise_error(Date::Error)
  ensure
    restore_env("FX_ON", previous)
  end

  it "prints seed when FX_SOURCE is unset" do
    previous = ENV["FX_SOURCE"]
    ENV.delete("FX_SOURCE")
    allow(SyncExchangeRatesJob).to receive(:perform_now).and_return(4)

    expect { Rake::Task["fx:sync"].invoke }.to output(/source=seed/).to_stdout
  ensure
    restore_env("FX_SOURCE", previous)
  end
end
# rubocop:enable RSpec/DescribeClass, RSpec/SpecFilePathFormat
