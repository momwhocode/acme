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
# HR session account. Seeded as Sharvari Potnis unless HR_EMAIL already exists.

class User < ApplicationRecord
  DEFAULT_EMAIL = "hr@acme.test".freeze
  DEFAULT_PASSWORD = "whiteaeroplane".freeze
  DEFAULT_FIRST_NAME = "Sharvari".freeze
  DEFAULT_LAST_NAME = "Potnis".freeze

  has_secure_password

  before_validation :normalize_attributes

  validates :first_name, :last_name, presence: true, length: { maximum: 255 }
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }, length: { maximum: 255 }
  validates :password, length: { minimum: 8, maximum: 72 }, allow_nil: true

  # Idempotent. Existing HR_EMAIL keeps the password; name is reset to the seed greeting.
  def self.seed_hr!(email: ENV["HR_EMAIL"].presence || DEFAULT_EMAIL, password: ENV["HR_PASSWORD"])
    normalized = email.to_s.strip.downcase.presence || DEFAULT_EMAIL
    existing = find_by("LOWER(email) = ?", normalized)
    if existing
      existing.update!(first_name: DEFAULT_FIRST_NAME, last_name: DEFAULT_LAST_NAME)
      return existing
    end

    create!(
      first_name: DEFAULT_FIRST_NAME,
      last_name: DEFAULT_LAST_NAME,
      email: normalized,
      password: hr_password!(password)
    )
  end

  def as_session_json
    { id: id, email: email, first_name: first_name, last_name: last_name }
  end

  def self.hr_password!(password)
    chosen = password.presence || (Rails.env.production? ? nil : DEFAULT_PASSWORD)
    return chosen if chosen.present?

    raise ArgumentError, I18n.t("errors.hr_password_required")
  end
  private_class_method :hr_password!

  private

  def normalize_attributes
    self.first_name = first_name.to_s.strip.presence
    self.last_name = last_name.to_s.strip.presence
    self.email = email.to_s.strip.downcase.presence
  end
end
