CREATE OR REPLACE FUNCTION compensation_within_employment() RETURNS trigger
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

CREATE OR REPLACE FUNCTION employment_covers_compensation() RETURNS trigger
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

DROP TRIGGER IF EXISTS compensation_records_within_employment ON compensation_records;
CREATE TRIGGER compensation_records_within_employment
BEFORE INSERT OR UPDATE OF employee_id, effective_date ON compensation_records
FOR EACH ROW EXECUTE PROCEDURE compensation_within_employment();

DROP TRIGGER IF EXISTS employees_cover_compensation ON employees;
CREATE TRIGGER employees_cover_compensation
BEFORE UPDATE OF started_on, left_on ON employees
FOR EACH ROW EXECUTE PROCEDURE employment_covers_compensation();
