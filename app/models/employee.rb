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
#  last_name       :string           not null
#  left_on         :date
#  level           :string
#  started_on      :date             not null
#  status          :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_employees_on_directory_filters  (department,country,employment_type,status)
#  index_employees_on_lower_email        (lower((email)::text)) UNIQUE
#
class Employee < ApplicationRecord
  EMPLOYMENT_TYPES = %w[full-time part-time contractor freelancer intern].freeze
  STATUSES = %w[active left].freeze

  has_many :compensation_records, dependent: :restrict_with_error, inverse_of: :employee

  before_validation :normalize_attributes

  validates :first_name, :last_name, :country, :department, presence: true, length: { maximum: 255 }
  validates :started_on, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }, length: { maximum: 255 }
  validates :employment_type, presence: true, inclusion: { in: EMPLOYMENT_TYPES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :level, length: { maximum: 50 }, allow_nil: true
  validate :left_on_not_before_started_on
  validate :left_on_present_for_leavers
  validate :employment_dates_cover_compensation

  private

  def normalize_attributes
    self.first_name = first_name.to_s.strip.presence
    self.last_name = last_name.to_s.strip.presence
    self.email = email.to_s.strip.downcase.presence
    self.country = country.to_s.strip.upcase.presence
    self.department = department.to_s.strip.gsub(/\s+/, " ").downcase.presence
    self.employment_type = employment_type.to_s.strip.downcase.presence
    self.status = status.to_s.strip.downcase.presence
    self.level = level.to_s.strip.presence
  end

  def left_on_not_before_started_on
    return if left_on.blank? || started_on.blank?
    return unless left_on < started_on

    errors.add(:left_on, "must be on or after started_on")
  end

  def left_on_present_for_leavers
    return unless status == "left" && left_on.blank?

    errors.add(:left_on, "is required when status is left")
  end

  def employment_dates_cover_compensation
    return if started_on.blank?

    dates = compensation_effective_dates
    return if dates.empty?

    earliest, latest = dates.minmax
    if started_on > earliest
      errors.add(:started_on, "must be on or before the earliest compensation date")
    end
    if left_on.present? && left_on < latest
      errors.add(:left_on, "must be on or after the latest compensation date")
    end
  end

  def compensation_effective_dates
    records = compensation_records
    dates = records.loaded? ? records.map(&:effective_date) : records.pluck(:effective_date)
    dates.compact
  end
end
