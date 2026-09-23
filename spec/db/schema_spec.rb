# Catalog of the live Postgres schema — extensions, unique indexes, FKs, and checks.
require "rails_helper"

RSpec.describe "directory schema" do
  def connection
    ApplicationRecord.connection
  end

  def index_names(table)
    connection.indexes(table).map(&:name)
  end

  def unique_index?(table, columns)
    connection.indexes(table).any? { |index| index.unique && index.columns == columns }
  end

  def foreign_keys(table)
    connection.foreign_keys(table)
  end

  def check_names(table)
    connection.check_constraints(table).map(&:name)
  end

  it "enables uuid and trigram extensions" do
    expect(connection.extension_enabled?("pgcrypto")).to be(true)
    expect(connection.extension_enabled?("pg_trgm")).to be(true)
  end

  it "keeps the product tables" do
    expect(connection.tables).to include(
      "users", "employees", "compensation_records", "exchange_rates", "pay_bands", "audit_events"
    )
  end

  it "uniques emails case-insensitively" do
    expect(index_names(:employees)).to include("index_employees_on_lower_email")
    expect(index_names(:users)).to include("index_users_on_lower_email")
    expect(connection.indexes(:employees).find { |index| index.name == "index_employees_on_email" }).to be_nil
  end

  it "uniques one pay row per hire and date" do
    expect(unique_index?(:compensation_records, %w[employee_id effective_date])).to be(true)
  end

  it "uniques one FX quote per pair and date" do
    expect(unique_index?(:exchange_rates, %w[from_currency to_currency effective_date])).to be(true)
  end

  it "uniques one pay band per level and currency" do
    expect(unique_index?(:pay_bands, %w[level currency])).to be(true)
  end

  it "indexes directory search, filters, name sort, and employment dates" do
    expect(index_names(:employees)).to include(
      "index_employees_on_directory_search",
      "index_employees_on_directory_filters",
      "index_employees_on_directory_name",
      "index_employees_on_employment_dates",
      "index_employees_on_manager_id"
    )
  end

  it "indexes audit events for a hire timeline" do
    expect(index_names(:audit_events)).to include(
      "index_audit_events_on_record_type_and_record_id_and_created_at"
    )
  end

  it "cascades pay rows when a hire is deleted" do
    key = foreign_keys(:compensation_records).find { |fk| fk.to_table == "employees" }

    expect(key).to have_attributes(on_delete: :cascade)
  end

  it "nullifies reports when a manager is deleted" do
    key = foreign_keys(:employees).find { |fk| fk.column == "manager_id" }

    expect(key).to have_attributes(to_table: "employees", on_delete: :nullify)
  end

  it "nullifies audit actors when the HR user is deleted" do
    key = foreign_keys(:audit_events).find { |fk| fk.column == "actor_id" }

    expect(key).to have_attributes(to_table: "users", on_delete: :nullify)
  end

  it "checks employment, pay, FX, and band invariants" do
    expect(check_names(:employees)).to include(
      "employees_employment_type_allowed",
      "employees_status_allowed",
      "employees_country_iso",
      "employees_left_on_covers_start"
    )
    expect(check_names(:compensation_records)).to include(
      "compensation_records_pay_period_allowed",
      "compensation_records_currency_iso",
      "compensation_records_base_amount_non_negative",
      "compensation_records_hourly_hours"
    )
    expect(check_names(:exchange_rates)).to include("exchange_rates_rate_positive")
    expect(check_names(:pay_bands)).to include("pay_bands_midpoint_positive")
  end
end
