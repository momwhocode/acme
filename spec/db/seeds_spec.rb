# db/seeds.rb is the DBA entry point: HR, FX, bands, then the 10k directory.
require "rails_helper"

RSpec.describe "db/seeds.rb" do
  it "seeds HR, FX, and pay bands before the directory" do
    allow(User).to receive(:seed_hr!).and_return(true)
    allow(ExchangeRate).to receive(:seed!).and_return(true)
    allow(PayBand).to receive(:seed!).and_return(true)
    allow(DirectorySeeder).to receive(:call).and_return({})

    load Rails.root.join("db/seeds.rb")

    expect(User).to have_received(:seed_hr!).ordered
    expect(ExchangeRate).to have_received(:seed!).ordered
  end

  it "finishes with pay bands and the directory" do
    allow(User).to receive(:seed_hr!).and_return(true)
    allow(ExchangeRate).to receive(:seed!).and_return(true)
    allow(PayBand).to receive(:seed!).and_return(true)
    allow(DirectorySeeder).to receive(:call).and_return({})

    load Rails.root.join("db/seeds.rb")

    expect(PayBand).to have_received(:seed!).ordered
    expect(DirectorySeeder).to have_received(:call).ordered
  end
end
