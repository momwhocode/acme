# == Schema Information
#
# Table name: employees
#
#  id              :uuid             not null, primary key
#  country         :string           not null
#  department      :string           not null
#  email           :string           not null
#  employment_type :string           not null
#  first_name      :string           not null
#  job_title       :string
#  last_name       :string           not null
#  left_on         :date
#  level           :string
#  started_on      :date             not null
#  status          :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  manager_id      :uuid
#
# Indexes
#
#  index_employees_on_country            (country)
#  index_employees_on_directory_filters  (department,country,employment_type,status)
#  index_employees_on_directory_name     (last_name,first_name,id)
#  index_employees_on_directory_search   (((((((first_name)::text || ' '::text) || (last_name)::text) || ' '::text) || (email)::text)) gin_trgm_ops) USING gin
#  index_employees_on_employment_dates   (started_on,left_on)
#  index_employees_on_level              (level)
#  index_employees_on_lower_email        (lower((email)::text)) UNIQUE
#  index_employees_on_manager_id         (manager_id)
#  index_employees_on_status             (status)
#
# Foreign Keys
#
#  fk_rails_...  (manager_id => employees.id) ON DELETE => nullify
#
FactoryBot.define do
  factory :employee do
    first_name { "Ada" }
    last_name { "Lovelace" }
    sequence(:email) { |n| "ada.lovelace.#{n}@acme.test" }
    country { "GB" }
    department { "Engineering" }
    employment_type { "full-time" }
    status { "active" }
    started_on { Date.new(2024, 1, 1) }

    trait :left do
      status { "left" }
      left_on { Date.new(2025, 6, 1) }
    end
  end
end
