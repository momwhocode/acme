# Manager self-FK, pay-band midpoints, and the append-only HR audit log.

class AddHrOperations < ActiveRecord::Migration[7.2]
  def change
    add_reference :employees, :manager, type: :uuid, foreign_key: { to_table: :employees }, null: true

    create_table :pay_bands, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :level, null: false
      t.string :currency, limit: 3, null: false
      t.decimal :midpoint, precision: 15, scale: 2, null: false
      t.timestamps
    end
    add_index :pay_bands, %i[level currency], unique: true

    create_table :audit_events, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :actor_id
      t.string :action, null: false
      t.string :record_type, null: false
      t.uuid :record_id
      t.jsonb :payload, null: false, default: {}
      t.timestamps
    end
    add_index :audit_events, %i[record_type record_id created_at]
  end
end
