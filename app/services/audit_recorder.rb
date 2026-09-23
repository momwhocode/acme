# Append-only HR action log. Failures here should roll back the write that recorded them.

class AuditRecorder
  def self.record(actor:, action:, record:, payload: {})
    AuditEvent.create!(
      actor_id: actor&.id,
      action: action,
      record_type: record.class.name,
      record_id: record.id,
      payload: payload
    )
  end
end
