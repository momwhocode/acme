class CreateExchangeRates < ActiveRecord::Migration[7.2]
  def change
    create_table :exchange_rates, id: :uuid do |t|
      t.string :from_currency, null: false, limit: 3
      t.string :to_currency, null: false, limit: 3
      t.decimal :rate, precision: 18, scale: 8, null: false
      t.date :effective_date, null: false
      t.timestamps
    end

    add_index :exchange_rates, [:from_currency, :to_currency, :effective_date],
              unique: true,
              name: "index_exchange_rates_on_currencies_and_effective_date"
  end
end
