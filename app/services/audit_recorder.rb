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
