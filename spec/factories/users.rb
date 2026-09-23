# == Schema Information
#
# Table name: users
#
#  id              :uuid             not null, primary key
#  email           :string           not null
#  first_name      :string           not null
#  last_name       :string           not null
#  password_digest :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_users_on_lower_email  (lower((email)::text)) UNIQUE
#
FactoryBot.define do
  factory :user do
    first_name { "Sharvari" }
    last_name { "Potnis" }
    sequence(:email) { |n| "hr.#{n}@acme.test" }
    password { "password" }
  end
end
