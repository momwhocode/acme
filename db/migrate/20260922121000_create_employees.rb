# Directory hire table. Case-insensitive email uniqueness is added in a later migration.

class CreateEmployees < ActiveRecord::Migration[7.2]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :employees, id: :uuid do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :country, null: false
      t.string :department, null: false
      t.string :employment_type, null: false
      t.string :status, null: false
      t.string :level
      t.date :started_on, null: false
      t.date :left_on
      t.timestamps
    end

    add_index :employees, :email, unique: true
    add_index :employees, [:department, :country, :employment_type, :status],
              name: "index_employees_on_directory_filters"
  end
end
