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
#  index_employees_on_email              (email) UNIQUE
#
class Employee < ApplicationRecord
  EMPLOYMENT_TYPES = %w[full-time part-time contractor freelancer intern].freeze
  STATUSES = %w[active left].freeze

  has_many :compensation_records, dependent: :destroy, inverse_of: :employee

  before_validation :normalize_attributes

  validates :first_name, :last_name, :country, :department, :started_on, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :employment_type, presence: true, inclusion: { in: EMPLOYMENT_TYPES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validate :left_on_not_before_started_on
  validate :leaver_dates_match_status

  private

  def normalize_attributes
    self.first_name = first_name.to_s.strip.presence
    self.last_name = last_name.to_s.strip.presence
    self.email = email.to_s.strip.downcase.presence
    self.country = country.to_s.strip.presence
    self.department = department.to_s.strip.presence
    self.employment_type = employment_type.to_s.strip.downcase.presence
    self.status = status.to_s.strip.downcase.presence
    self.level = level.to_s.strip.presence
  end

  def left_on_not_before_started_on
    return if left_on.blank? || started_on.blank?
    return unless left_on < started_on

    errors.add(:left_on, "must be on or after started_on")
  end

  def leaver_dates_match_status
    if status == "left" && left_on.blank?
      errors.add(:left_on, "is required when status is left")
    elsif status == "active" && left_on.present?
      errors.add(:left_on, "must be blank when status is active")
    end
  end
end
