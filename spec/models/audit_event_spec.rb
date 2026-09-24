# == Schema Information
#
# Table name: audit_events
#
#  id          :uuid             not null, primary key
#  action      :string           not null
#  payload     :jsonb            not null
#  record_type :string           not null
#  created_at  :datetime         not null
#  actor_id    :uuid
#  record_id   :uuid             not null
#
# Indexes
#
#  index_audit_events_on_record_type_and_record_id_and_created_at  (record_type,record_id,created_at)
#
# Foreign Keys
#
#  fk_rails_...  (actor_id => users.id) ON DELETE => nullify
#
require "rails_helper"

RSpec.describe AuditEvent do
  it "lists employee and compensation events newest first" do
    actor = create(:user, first_name: "Sharvari", last_name: "Potnis")
    employee = create(:employee)
    record = create(:compensation_record, employee: employee)
    older = create(:audit_event, actor: actor, action: "onboard", record_type: "Employee",
                                 record_id: employee.id, created_at: 2.days.ago)
    newer = create(:audit_event, actor: actor, action: "create", record_type: "CompensationRecord",
                                 record_id: record.id, created_at: 1.day.ago)
    create(:audit_event, action: "update", record_type: "Employee", record_id: SecureRandom.uuid)

    events = described_class.for_employee(employee)

    expect(events).to eq([ newer, older ])
    expect(newer.as_api_json).to include(
      action: "create",
      record_type: "CompensationRecord",
      actor_name: "Sharvari Potnis"
    )
  end

  it "labels a missing actor as HR" do
    event = create(:audit_event, actor: nil)

    expect(event.as_api_json[:actor_name]).to eq("HR")
  end
end
