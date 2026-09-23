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
# Append-only HR log. Profile reads Employee plus that hire's compensation events.

class AuditEvent < ApplicationRecord
  belongs_to :actor, class_name: "User", optional: true

  def self.for_employee(employee)
    where(
      "(record_type = :employee AND record_id = :id) OR (record_type = :comp AND record_id IN (:comp_ids))",
      employee: "Employee",
      id: employee.id,
      comp: "CompensationRecord",
      comp_ids: employee.compensation_records.select(:id)
    ).order(created_at: :desc)
  end

  def as_api_json
    {
      id: id,
      action: action,
      record_type: record_type,
      record_id: record_id,
      payload: payload,
      actor_name: actor ? "#{actor.first_name} #{actor.last_name}".strip : "HR",
      created_at: created_at
    }
  end
end
