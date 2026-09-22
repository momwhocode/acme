# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_09_22_180000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "compensation_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "employee_id", null: false
    t.decimal "base_amount", precision: 15, scale: 2, null: false
    t.string "currency", limit: 3, null: false
    t.date "effective_date", null: false
    t.string "change_reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "pay_period", null: false
    t.decimal "hours_per_week", precision: 5, scale: 2
    t.index ["employee_id", "effective_date"], name: "index_compensation_records_on_employee_id_and_effective_date", unique: true
  end

  create_table "employees", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", null: false
    t.string "country", null: false
    t.string "department", null: false
    t.string "employment_type", null: false
    t.string "status", null: false
    t.string "level"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "started_on", null: false
    t.date "left_on"
    t.index "lower((email)::text)", name: "index_employees_on_lower_email", unique: true
    t.index ["department", "country", "employment_type", "status"], name: "index_employees_on_directory_filters"
  end

  create_table "exchange_rates", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "from_currency", limit: 3, null: false
    t.string "to_currency", limit: 3, null: false
    t.decimal "rate", precision: 18, scale: 8, null: false
    t.date "effective_date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["from_currency", "to_currency", "effective_date"], name: "index_exchange_rates_on_currencies_and_effective_date", unique: true
  end

  add_foreign_key "compensation_records", "employees"
end
