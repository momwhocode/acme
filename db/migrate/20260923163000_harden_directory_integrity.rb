# DB rules that match the app: cascade pay on hire delete, nullify manager/actor,
# check allowed enums, and index the analytics window plus default directory sort.

class HardenDirectoryIntegrity < ActiveRecord::Migration[7.2]
  def change
    remove_foreign_key :compensation_records, :employees
    add_foreign_key :compensation_records, :employees, on_delete: :cascade

    remove_foreign_key :employees, column: :manager_id
    add_foreign_key :employees, :employees, column: :manager_id, on_delete: :nullify

    add_foreign_key :audit_events, :users, column: :actor_id, on_delete: :nullify

    add_index :employees, %i[started_on left_on], name: "index_employees_on_employment_dates"
    add_index :employees, %i[last_name first_name id], name: "index_employees_on_directory_name"

    add_check_constraint :employees,
      "employment_type IN ('full-time', 'part-time', 'contractor', 'freelancer', 'intern')",
      name: "employees_employment_type_allowed"
    add_check_constraint :employees,
      "status IN ('active', 'left')",
      name: "employees_status_allowed"
    add_check_constraint :employees,
      "country ~ '^[A-Z]{2}$'",
      name: "employees_country_iso"
    add_check_constraint :employees,
      "left_on IS NULL OR left_on >= started_on",
      name: "employees_left_on_covers_start"

    add_check_constraint :compensation_records,
      "pay_period IN ('hourly', 'daily', 'monthly', 'annual')",
      name: "compensation_records_pay_period_allowed"
    add_check_constraint :compensation_records,
      "currency ~ '^[A-Z]{3}$'",
      name: "compensation_records_currency_iso"
    add_check_constraint :compensation_records,
      "base_amount >= 0",
      name: "compensation_records_base_amount_non_negative"
    add_check_constraint :compensation_records,
      "hours_per_week IS NULL OR (hours_per_week > 0 AND hours_per_week <= 168)",
      name: "compensation_records_hours_range"
    add_check_constraint :compensation_records,
      "pay_period <> 'hourly' OR hours_per_week IS NOT NULL",
      name: "compensation_records_hourly_hours"

    add_check_constraint :exchange_rates,
      "from_currency ~ '^[A-Z]{3}$' AND to_currency ~ '^[A-Z]{3}$'",
      name: "exchange_rates_currency_iso"
    add_check_constraint :exchange_rates,
      "rate > 0",
      name: "exchange_rates_rate_positive"

    add_check_constraint :pay_bands,
      "currency ~ '^[A-Z]{3}$'",
      name: "pay_bands_currency_iso"
    add_check_constraint :pay_bands,
      "midpoint > 0",
      name: "pay_bands_midpoint_positive"
  end
end
