# == Schema Information
#
# Table name: audit_events
#
#  id          :uuid             not null, primary key
#  action      :string           not null
#  payload     :jsonb            not null
#  record_type :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  actor_id    :uuid
#  record_id   :uuid
#
# Indexes
#
#  index_audit_events_on_record_type_and_record_id_and_created_at  (record_type,record_id,created_at)
#
# Foreign Keys
#
#  fk_rails_...  (actor_id => users.id) ON DELETE => nullify
#
FactoryBot.define do
  factory :audit_event do
    actor factory: :user
    action { "update" }
    record_type { "Employee" }
    record_id { SecureRandom.uuid }
    payload { {} }
  end
end
