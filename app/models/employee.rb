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
#  manager_id      :uuid
#
# Indexes
#
#  index_employees_on_directory_filters  (department,country,employment_type,status)
#  index_employees_on_directory_search   (((((((first_name)::text || ' '::text) || (last_name)::text) || ' '::text) || (email)::text)) gin_trgm_ops) USING gin
#  index_employees_on_lower_email        (lower((email)::text)) UNIQUE
#  index_employees_on_manager_id         (manager_id)
#
# Foreign Keys
#
#  fk_rails_...  (manager_id => employees.id)
#
# Directory hire. Compensation is append-only; status changes go through offboard / rehire.

class Employee < ApplicationRecord
  EMPLOYMENT_TYPES = %w[full-time part-time contractor freelancer intern].freeze
  STATUSES = %w[active left].freeze
  LEVEL_BUCKETS = {
    "L1" => %w[L1 IC1],
    "L2" => %w[L2 IC2],
    "L3" => %w[L3 IC3],
    "L4" => %w[L4 IC4],
    "L5+" => %w[L5 L6 L7 L8 IC5 IC6 IC7 IC8 M1 M2 M3 M4 M5]
  }.freeze

  def self.levels_in_bucket(*values)
    values.flatten.flat_map { |value| LEVEL_BUCKETS[value.to_s] || [ value.to_s ] }.uniq
  end

  has_many :compensation_records, dependent: :destroy, inverse_of: :employee
  belongs_to :manager, class_name: "Employee", optional: true
  has_many :direct_reports, class_name: "Employee", foreign_key: :manager_id, inverse_of: :manager, dependent: :nullify

  before_validation :normalize_attributes

  validates :first_name, :last_name, :department, presence: true, length: { maximum: 255 }
  validates :country, presence: true, format: { with: /\A[A-Z]{2}\z/ }
  validates :started_on, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }, length: { maximum: 255 }
  validates :employment_type, presence: true, inclusion: { in: EMPLOYMENT_TYPES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :level, length: { maximum: 50 }, allow_nil: true
  validate :manager_is_not_self
  validate :left_on_not_before_started_on
  validate :left_on_present_for_leavers
  validate :employment_dates_cover_compensation

  DIRECTORY_JSON_KEYS = %i[
    id first_name last_name email country department
    employment_type status level started_on left_on manager_id
  ].freeze

  def as_directory_json
    DIRECTORY_JSON_KEYS.index_with { |key| public_send(key) }.merge(
      manager_name: manager && "#{manager.first_name} #{manager.last_name}".strip
    )
  end

  def display_name
    "#{first_name} #{last_name}".strip
  end

  def current_compensation_record(as_of: Date.current)
    cutoff = [ left_on, as_of.to_date ].compact.min
    records = compensation_records
    if records.loaded?
      records.select { |record| record.effective_date && record.effective_date <= cutoff }
             .max_by { |record| [ record.effective_date, record.id ] }
    else
      records.where(effective_date: ..cutoff).order(effective_date: :desc, id: :desc).first
    end
  end

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

  def manager_is_not_self
    return if manager_id.blank? || manager_id != id

    errors.add(:manager_id, "cannot manage themselves")
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
