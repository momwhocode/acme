# db/seeds.rb is the DBA entry point: HR, FX, bands, then the 10k directory.
require "rails_helper"

RSpec.describe "db/seeds.rb" do
  def load_seeds
    load Rails.root.join("db/seeds.rb")
  end

  it "does not seed the test database" do
    allow(User).to receive(:seed_hr!)
    allow(DirectorySeeder).to receive(:call)

    load_seeds

    expect(User).not_to have_received(:seed_hr!)
    expect(DirectorySeeder).not_to have_received(:call)
  end

  it "seeds HR, FX, and pay bands before the directory outside test" do
    allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("development"))
    allow(User).to receive(:seed_hr!).and_return(true)
    allow(ExchangeRate).to receive(:seed!).and_return(true)
    allow(PayBand).to receive(:seed!).and_return(true)
    allow(DirectorySeeder).to receive(:call).and_return({})

    load_seeds

    expect(User).to have_received(:seed_hr!).ordered
    expect(ExchangeRate).to have_received(:seed!).ordered
  end

  it "finishes with pay bands and the directory outside test" do
    allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("development"))
    allow(User).to receive(:seed_hr!).and_return(true)
    allow(ExchangeRate).to receive(:seed!).and_return(true)
    allow(PayBand).to receive(:seed!).and_return(true)
    allow(DirectorySeeder).to receive(:call).and_return({})

    load_seeds

    expect(PayBand).to have_received(:seed!).ordered
    expect(DirectorySeeder).to have_received(:call).ordered
  end
end
