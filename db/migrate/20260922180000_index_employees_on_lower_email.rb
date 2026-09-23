# Replace the case-sensitive email unique index so HR@ and hr@ cannot both exist.

class IndexEmployeesOnLowerEmail < ActiveRecord::Migration[7.2]
  def change
    remove_index :employees, :email
    add_index :employees, "LOWER(email)", unique: true, name: "index_employees_on_lower_email"
  end
end
