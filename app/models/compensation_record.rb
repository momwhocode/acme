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
#  fk_rails_...  (employee_id => employees.id)
#
class CompensationRecord < ApplicationRecord
  belongs_to :employee, inverse_of: :compensation_records

  before_validation :normalize_attributes

  validates :base_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true, length: { is: 3 }
  validates :pay_period, presence: true, inclusion: { in: CurrencyNormalizer::PAY_PERIODS }
  validates :effective_date, presence: true
  validates :effective_date, uniqueness: { scope: :employee_id }
  validates :hours_per_week, presence: true, if: :hourly?
  validates :hours_per_week, numericality: { greater_than: 0 }, allow_nil: true

  private

  def normalize_attributes
    self.currency = currency.to_s.strip.upcase.presence
    self.pay_period = pay_period.to_s.strip.downcase.presence
    self.change_reason = change_reason.to_s.strip.presence
  end

  def hourly?
    pay_period == "hourly"
  end
end
