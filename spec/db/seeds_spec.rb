# db/seeds.rb is the DBA entry point: HR, FX, bands, then the 10k directory.
require "rails_helper"

RSpec.describe "db/seeds.rb" do
  it "seeds HR, FX, and pay bands before the directory" do
    expect(User).to receive(:seed_hr!).ordered.and_return(true)
    expect(ExchangeRate).to receive(:seed!).ordered.and_return(true)
    expect(PayBand).to receive(:seed!).ordered.and_return(true)
    expect(DirectorySeeder).to receive(:call).ordered.and_return({})

    load Rails.root.join("db/seeds.rb")
  end
end
