require "rails_helper"

RSpec.describe AuditRecorder do
  it "writes an append-only event for the actor and record" do
    actor = create(:user)
    employee = create(:employee)

    event = described_class.record(
      actor: actor,
      action: "update",
      record: employee,
      payload: { first_name: "Grace" }
    )

    expect(event).to have_attributes(
      actor_id: actor.id,
      action: "update",
      record_type: "Employee",
      record_id: employee.id,
      payload: { "first_name" => "Grace" }
    )
  end

  it "allows a system write without an actor" do
    employee = create(:employee)

    event = described_class.record(actor: nil, action: "import", record: employee)

    expect(event.actor_id).to be_nil
    expect(event.payload).to eq({})
  end
end
