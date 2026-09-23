# == Schema Information
#
# Table name: compensation_records
#
#  id             :uuid             not null, primary key
#  base_amount    :decimal(15, 2)   not null
#  change_reason  :string
#  currency       :string(3)        not null
#  effective_date :date             not null
#  hours_per_week :decimal(5, 2)
#  pay_period     :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  employee_id    :uuid             not null
#
# Indexes
#
#  index_compensation_records_on_employee_id_and_effective_date  (employee_id,effective_date) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (employee_id => employees.id) ON DELETE => cascade
#
FactoryBot.define do
  factory :compensation_record do
    employee
    base_amount { 80_000 }
    currency { "USD" }
    pay_period { "annual" }
    effective_date { Date.new(2024, 1, 1) }

    trait :hourly do
      pay_period { "hourly" }
      hours_per_week { 40 }
    end
  end
end
