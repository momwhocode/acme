# Trigram GIN on "first last email" so directory `q` stays in Postgres.

class AddEmployeeDirectorySearchIndex < ActiveRecord::Migration[7.2]
  def up
    enable_extension "pg_trgm" unless extension_enabled?("pg_trgm")

    execute <<~SQL.squish
      CREATE INDEX index_employees_on_directory_search
        ON employees
        USING gin ((first_name || ' ' || last_name || ' ' || email) gin_trgm_ops)
    SQL
  end

  def down
    remove_index :employees, name: :index_employees_on_directory_search
  end
end
