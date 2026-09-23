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
# One effective-dated pay row. Unique per employee + effective_date.

class CompensationRecord < ApplicationRecord
  PAY_PERIODS = %w[hourly daily monthly annual].freeze
  ATTR_KEYS = %i[base_amount currency pay_period hours_per_week effective_date change_reason].freeze

  belongs_to :employee, inverse_of: :compensation_records

  before_validation :normalize_attributes

  validates :base_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true, format: { with: /\A[A-Z]{3}\z/ },
                       inclusion: { in: ->(_) { ExchangeRate.supported_currencies } }
  validates :pay_period, presence: true, inclusion: { in: PAY_PERIODS }
  validates :effective_date, presence: true
  validates :effective_date, uniqueness: { scope: :employee_id }
  validates :hours_per_week, presence: true, if: :hourly?
  validates :hours_per_week, numericality: { greater_than: 0, less_than_or_equal_to: 168 }, allow_nil: true
  validates :change_reason, length: { maximum: 255 }, allow_nil: true
  validate :effective_date_within_employment

  API_JSON_KEYS = %i[
    id employee_id base_amount currency pay_period
    hours_per_week effective_date change_reason
  ].freeze

  def as_api_json
    API_JSON_KEYS.index_with { |key| public_send(key) }
  end

  private

  def normalize_attributes
    self.currency = currency.to_s.strip.upcase.presence
    self.pay_period = pay_period.to_s.strip.downcase.presence
    self.change_reason = change_reason.to_s.strip.presence
  end

  def hourly?
    pay_period == "hourly"
  end

  def effective_date_within_employment
    return if employee.blank? || effective_date.blank?

    if effective_date < employee.started_on
      errors.add(:effective_date, :after_started_on)
    elsif employee.left_on.present? && effective_date > employee.left_on
      errors.add(:effective_date, :before_left_on)
    end
  end
end
