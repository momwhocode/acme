require "rails_helper"
require "rake"

# Rake tasks have no class constant. This file covers lib/tasks/fx.rake.
# rubocop:disable RSpec/DescribeClass, RSpec/SpecFilePathFormat
RSpec.describe "fx:sync" do
  include ActiveSupport::Testing::TimeHelpers

  before do
    Rails.application.load_tasks unless Rake::Task.task_defined?("fx:sync")
    Rake::Task["fx:sync"].reenable
  end

  it "passes the date argument to the job and prints the count" do
    allow(SyncExchangeRatesJob).to receive(:perform_now).and_return(4)

    expect { Rake::Task["fx:sync"].invoke("2026-09-01") }.to output(/Synced 4 exchange rates for 2026-09-01/).to_stdout
    expect(SyncExchangeRatesJob).to have_received(:perform_now).with(Date.new(2026, 9, 1))
  end

  it "defaults the snapshot date to Date.current" do
    allow(SyncExchangeRatesJob).to receive(:perform_now).and_return(4)

    travel_to Date.new(2026, 9, 22) do
      expect { Rake::Task["fx:sync"].invoke }.to output(/for 2026-09-22/).to_stdout
      expect(SyncExchangeRatesJob).to have_received(:perform_now).with(Date.new(2026, 9, 22))
    end
  end

  it "prints the source from credentials" do
    allow(AppConfig).to receive(:fx_source).and_return("live")
    allow(SyncExchangeRatesJob).to receive(:perform_now).and_return(4)

    expect { Rake::Task["fx:sync"].invoke }.to output(/source=live/).to_stdout
  end

  it "raises when the date argument is not ISO8601" do
    expect { Rake::Task["fx:sync"].invoke("tomorrow") }.to raise_error(Date::Error)
  end

  it "prints seed when credentials fx.source is the catalog" do
    allow(AppConfig).to receive(:fx_source).and_return("seed")
    allow(SyncExchangeRatesJob).to receive(:perform_now).and_return(4)

    expect { Rake::Task["fx:sync"].invoke }.to output(/source=seed/).to_stdout
  end
end
# rubocop:enable RSpec/DescribeClass, RSpec/SpecFilePathFormat
