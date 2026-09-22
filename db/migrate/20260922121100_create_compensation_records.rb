class CreateCompensationRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :compensation_records, id: :uuid do |t|
      t.references :employee, type: :uuid, null: false, foreign_key: true, index: false
      t.decimal :base_amount, precision: 15, scale: 2, null: false
      t.string :currency, null: false, limit: 3
      t.string :pay_period, null: false
      t.decimal :hours_per_week, precision: 5, scale: 2
      t.date :effective_date, null: false
      t.string :change_reason
      t.timestamps
    end

    add_index :compensation_records, [:employee_id, :effective_date],
              unique: true,
              name: "index_compensation_records_on_employee_id_and_effective_date"
  end
end
