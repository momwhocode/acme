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
require "rails_helper"

RSpec.describe User do
  subject(:user) { build(:user) }

  describe "validations" do
    it "accepts a complete HR user" do
      expect(user).to be_valid
    end

    it "requires first_name" do
      expect(build(:user, first_name: nil)).not_to be_valid
    end

    it "requires last_name" do
      expect(build(:user, last_name: nil)).not_to be_valid
    end

    it "requires email" do
      expect(build(:user, email: nil)).not_to be_valid
    end

    it "rejects an invalid email" do
      expect(build(:user, email: "not-an-email")).not_to be_valid
    end

    it "rejects a duplicate email ignoring case" do
      create(:user, email: "hr@acme.test")

      expect(build(:user, email: "HR@acme.test")).not_to be_valid
    end

    it "requires a password on create" do
      expect(build(:user, password: nil)).not_to be_valid
    end

    it "rejects a password shorter than 8 characters" do
      expect(build(:user, password: "short")).not_to be_valid
    end

    it "rejects a first_name longer than 255 characters" do
      expect(build(:user, first_name: "A" * 256)).not_to be_valid
    end

    it "rejects a last_name longer than 255 characters" do
      expect(build(:user, last_name: "A" * 256)).not_to be_valid
    end

    it "rejects a blank first_name" do
      expect(build(:user, first_name: "  ")).not_to be_valid
    end

    it "rejects an email longer than 255 characters" do
      expect(build(:user, email: "#{"a" * 251}@x.io")).not_to be_valid
    end

    it "rejects a password longer than 72 characters" do
      expect(build(:user, password: "p" * 73)).not_to be_valid
    end
  end

  describe "normalize_attributes" do
    it "strips and downcases email" do
      user = build(:user, email: "  HR@Acme.TEST  ")
      user.validate

      expect(user.email).to eq("hr@acme.test")
    end

    it "strips names" do
      user = build(:user, first_name: " Ada ", last_name: " Lovelace ")
      user.validate

      expect(user.first_name).to eq("Ada")
      expect(user.last_name).to eq("Lovelace")
    end
  end

  describe ".seed_hr!" do
    it "creates the default HR account once" do
      expect { described_class.seed_hr! }.to change(described_class, :count).by(1)
      expect { described_class.seed_hr! }.not_to change(described_class, :count)
    end

    it "uses the default demo password outside production" do
      user = described_class.seed_hr!

      expect(user.authenticate(described_class::DEFAULT_PASSWORD)).to eq(user)
    end

    it "does not overwrite an existing password" do
      described_class.seed_hr!(password: "password")
      described_class.seed_hr!(password: "changed-password")

      expect(described_class.find_by!(email: "hr@acme.test").authenticate("password")).to be_truthy
    end

    it "requires credentials.hr.password in production when no user exists" do
      allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("production"))

      expect { described_class.seed_hr!(password: nil) }.to raise_error(ArgumentError, /credentials\.hr\.password/)
    end

    it "uses the HR email from credentials" do
      allow(AppConfig).to receive_messages(hr_email: "lead@acme.test", hr_password: "password1")

      user = described_class.seed_hr!

      expect(user.email).to eq("lead@acme.test")
    end

    it "keeps the default HR display name current" do
      user = create(:user, email: described_class::DEFAULT_EMAIL, first_name: "HR", last_name: "Manager")
      described_class.seed_hr!

      expect(user.reload).to have_attributes(first_name: "Sharvari", last_name: "Potnis")
    end

    it "falls back to the default email when the given email is blank" do
      user = described_class.seed_hr!(email: "  ")

      expect(user.email).to eq(described_class::DEFAULT_EMAIL)
    end
  end

  describe "#as_session_json" do
    it "omits the password digest" do
      expect(create(:user).as_session_json.keys).to contain_exactly(:id, :email, :first_name, :last_name)
    end
  end
end
