# Remaining directory invariants: leaver dates, self-manager, field lengths,
# pay inside employment, filter indexes, and an append-only audit log.
class HardenRemainingDirectoryIntegrity < ActiveRecord::Migration[7.2]
  def up
    add_check_constraint :employees,
      "status <> 'left' OR left_on IS NOT NULL",
      name: "employees_left_on_when_left"
    add_check_constraint :employees,
      "manager_id IS NULL OR manager_id <> id",
      name: "employees_manager_not_self"
    add_check_constraint :employees,
      "job_title IS NULL OR char_length(job_title) <= 255",
      name: "employees_job_title_length"
    add_check_constraint :employees,
      "level IS NULL OR char_length(level) <= 50",
      name: "employees_level_length"

    add_index :employees, :level, name: "index_employees_on_level"
    add_index :employees, :country, name: "index_employees_on_country"
    add_index :employees, :status, name: "index_employees_on_status"

    execute <<~SQL
      CREATE FUNCTION compensation_within_employment() RETURNS trigger
      LANGUAGE plpgsql AS $$
      DECLARE
        started date;
        ended date;
      BEGIN
        SELECT started_on, left_on INTO started, ended FROM employees WHERE id = NEW.employee_id;
        IF started IS NOT NULL AND NEW.effective_date < started THEN
          RAISE EXCEPTION 'compensation_records_within_employment' USING ERRCODE = '23514';
        END IF;
        IF ended IS NOT NULL AND NEW.effective_date > ended THEN
          RAISE EXCEPTION 'compensation_records_within_employment' USING ERRCODE = '23514';
        END IF;
        RETURN NEW;
      END;
      $$;

      CREATE FUNCTION employment_covers_compensation() RETURNS trigger
      LANGUAGE plpgsql AS $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM compensation_records
          WHERE employee_id = NEW.id
            AND (
              effective_date < NEW.started_on
              OR (NEW.left_on IS NOT NULL AND effective_date > NEW.left_on)
            )
        ) THEN
          RAISE EXCEPTION 'employees_cover_compensation' USING ERRCODE = '23514';
        END IF;
        RETURN NEW;
      END;
      $$;

      CREATE TRIGGER compensation_records_within_employment
      BEFORE INSERT OR UPDATE OF employee_id, effective_date ON compensation_records
      FOR EACH ROW EXECUTE PROCEDURE compensation_within_employment();

      CREATE TRIGGER employees_cover_compensation
      BEFORE UPDATE OF started_on, left_on ON employees
      FOR EACH ROW EXECUTE PROCEDURE employment_covers_compensation();
    SQL

    execute "DELETE FROM audit_events WHERE record_id IS NULL"
    change_column_null :audit_events, :record_id, false
    remove_column :audit_events, :updated_at
  end

  def down
    add_column :audit_events, :updated_at, :datetime
    execute "UPDATE audit_events SET updated_at = created_at WHERE updated_at IS NULL"
    change_column_null :audit_events, :updated_at, false
    change_column_null :audit_events, :record_id, true

    execute <<~SQL
      DROP TRIGGER IF EXISTS employees_cover_compensation ON employees;
      DROP TRIGGER IF EXISTS compensation_records_within_employment ON compensation_records;
      DROP FUNCTION IF EXISTS employment_covers_compensation();
      DROP FUNCTION IF EXISTS compensation_within_employment();
    SQL

    remove_index :employees, name: "index_employees_on_status"
    remove_index :employees, name: "index_employees_on_country"
    remove_index :employees, name: "index_employees_on_level"

    remove_check_constraint :employees, name: "employees_level_length"
    remove_check_constraint :employees, name: "employees_job_title_length"
    remove_check_constraint :employees, name: "employees_manager_not_self"
    remove_check_constraint :employees, name: "employees_left_on_when_left"
  end
end
