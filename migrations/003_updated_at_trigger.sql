-- 003_updated_at_trigger.sql
-- Keeps updated_at honest. DEFAULT now() only fires on INSERT, so without this
-- the column never changes after a row is created.
-- One shared plpgsql function, wired to every table that has an updated_at column:
-- users, user_data, workouts.
-- Author: Krupal | Created: 2026-08-13

BEGIN;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN

NEW.updated_at := NOW();
    RETURN NEW; -- Returns the modified row to be saved

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE
ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_data_updated_at
BEFORE UPDATE
ON user_data
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workouts_updated_at
BEFORE UPDATE
ON workouts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();



COMMIT;