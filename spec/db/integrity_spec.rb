# Postgres enforces uniqueness and delete rules even when ActiveRecord is bypassed.
require "rails_helper"

RSpec.describe "directory integrity" do
  def insert_employee!(attrs)
    now = Time.current
    Employee.insert_all!([
      {
        id: SecureRandom.uuid,
        first_name: "Ada",
        last_name: "Lovelace",
        country: "GB",
        department: "engineering",
        employment_type: "full-time",
        status: "active",
        started_on: Date.new(2024, 1, 1),
        created_at: now,
        updated_at: now
      }.merge(attrs)
    ])
  end

  it "rejects a second hire with the same email ignoring case" do
    insert_employee!(email: "ada@acme.test")

    expect {
      insert_employee!(email: "ADA@acme.test")
    }.to raise_error(ActiveRecord::RecordNotUnique)
  end

  it "rejects a second pay row on the same effective_date" do
    employee = create(:employee)
    create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1))

    expect {
      CompensationRecord.insert_all!([
        {
          id: SecureRandom.uuid,
          employee_id: employee.id,
          base_amount: 90_000,
          currency: "USD",
          pay_period: "annual",
          effective_date: Date.new(2024, 1, 1),
          created_at: Time.current,
          updated_at: Time.current
        }
      ])
    }.to raise_error(ActiveRecord::RecordNotUnique)
  end

  it "rejects a second FX quote for the same pair and date" do
    ExchangeRate.upsert_quote!(
      from_currency: "EUR", to_currency: "USD", rate: "1.10", effective_date: Date.new(2026, 1, 1)
    )

    expect {
      ExchangeRate.insert_all!([
        {
          id: SecureRandom.uuid,
          from_currency: "EUR",
          to_currency: "USD",
          rate: 1.2,
          effective_date: Date.new(2026, 1, 1),
          created_at: Time.current,
          updated_at: Time.current
        }
      ])
    }.to raise_error(ActiveRecord::RecordNotUnique)
  end

  it "cascades pay rows when a hire row is deleted" do
    employee = create(:employee)
    create(:compensation_record, employee: employee)

    Employee.delete(employee.id)

    expect(CompensationRecord.where(employee_id: employee.id)).to be_empty
  end

  it "nullifies reports when a manager row is deleted" do
    manager = create(:employee)
    report = create(:employee, manager: manager)

    Employee.delete(manager.id)

    expect(report.reload.manager_id).to be_nil
  end

  it "nullifies audit actors when the HR user is deleted" do
    actor = create(:user)
    event = create(:audit_event, actor: actor)

    User.delete(actor.id)

    expect(event.reload.actor_id).to be_nil
  end

  it "rejects an unknown employment_type at the database" do
    expect {
      insert_employee!(email: "bad-type@acme.test", employment_type: "contractor-plus")
    }.to raise_error(ActiveRecord::StatementInvalid, /employees_employment_type_allowed/)
  end

  it "rejects a leave date before started_on at the database" do
    expect {
      insert_employee!(
        email: "bad-leave@acme.test",
        status: "left",
        started_on: Date.new(2024, 6, 1),
        left_on: Date.new(2024, 1, 1)
      )
    }.to raise_error(ActiveRecord::StatementInvalid, /employees_left_on_covers_start/)
  end

  it "rejects a leaver without left_on at the database" do
    expect {
      insert_employee!(email: "no-leave@acme.test", status: "left", left_on: nil)
    }.to raise_error(ActiveRecord::StatementInvalid, /employees_left_on_when_left/)
  end

  it "rejects a self-manager at the database" do
    id = SecureRandom.uuid

    expect {
      insert_employee!(id: id, email: "self@acme.test", manager_id: id)
    }.to raise_error(ActiveRecord::StatementInvalid, /employees_manager_not_self/)
  end

  it "rejects an overlong job title at the database" do
    expect {
      insert_employee!(email: "title@acme.test", job_title: "x" * 256)
    }.to raise_error(ActiveRecord::StatementInvalid, /employees_job_title_length/)
  end

  it "rejects an overlong level at the database" do
    expect {
      insert_employee!(email: "level@acme.test", level: "L" * 51)
    }.to raise_error(ActiveRecord::StatementInvalid, /employees_level_length/)
  end

  it "rejects pay before started_on at the database" do
    employee = create(:employee, started_on: Date.new(2024, 6, 1))

    expect {
      CompensationRecord.insert_all!([
        {
          id: SecureRandom.uuid,
          employee_id: employee.id,
          base_amount: 80_000,
          currency: "USD",
          pay_period: "annual",
          effective_date: Date.new(2024, 1, 1),
          created_at: Time.current,
          updated_at: Time.current
        }
      ])
    }.to raise_error(ActiveRecord::StatementInvalid, /compensation_records_within_employment/)
  end

  it "rejects shrinking left_on before existing pay at the database" do
    employee = create(:employee, :left, started_on: Date.new(2024, 1, 1), left_on: Date.new(2025, 6, 1))
    create(:compensation_record, employee: employee, effective_date: Date.new(2025, 1, 1))

    expect {
      Employee.where(id: employee.id).update_all(left_on: Date.new(2024, 6, 1))
    }.to raise_error(ActiveRecord::StatementInvalid, /employees_cover_compensation/)
  end

  it "rejects an audit row without a record_id at the database" do
    expect {
      AuditEvent.insert_all!([
        {
          id: SecureRandom.uuid,
          action: "update",
          record_type: "Employee",
          payload: {},
          created_at: Time.current
        }
      ])
    }.to raise_error(ActiveRecord::NotNullViolation)
  end
end
