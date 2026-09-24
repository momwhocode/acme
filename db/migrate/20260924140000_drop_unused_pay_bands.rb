# Pay bands are unused after the profile stopped showing midpoint / compa-ratio.
class DropUnusedPayBands < ActiveRecord::Migration[7.2]
  def up
    drop_table :pay_bands
  end

  def down
    create_table :pay_bands, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :level, null: false
      t.string :currency, limit: 3, null: false
      t.decimal :midpoint, precision: 15, scale: 2, null: false
      t.timestamps
    end
    add_index :pay_bands, %i[level currency], unique: true
    add_check_constraint :pay_bands, "currency::text ~ '^[A-Z]{3}$'::text", name: "pay_bands_currency_iso"
    add_check_constraint :pay_bands, "midpoint > 0::numeric", name: "pay_bands_midpoint_positive"
  end
end
