# == Schema Information
#
# Table name: pay_bands
#
#  id         :uuid             not null, primary key
#  currency   :string(3)        not null
#  level      :string           not null
#  midpoint   :decimal(15, 2)   not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pay_bands_on_level_and_currency  (level,currency) UNIQUE
#
FactoryBot.define do
  factory :pay_band do
    level { "IC2" }
    currency { "USD" }
    midpoint { 85_000 }
  end
end
