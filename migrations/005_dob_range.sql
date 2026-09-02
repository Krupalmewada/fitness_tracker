-- 005_dob_range.sql
-- Tighten the date_of_birth rule: must be a plausible birth date for an adult
-- user. The old constraint only blocked future dates.
-- Author: Krupal | Created: 2026-08-23

BEGIN;

ALTER TABLE user_data DROP CONSTRAINT IF EXISTS user_data_date_of_birth_check;

ALTER TABLE user_data ADD CONSTRAINT user_data_dob_reasonable
  CHECK (
    date_of_birth IS NULL
    OR (
      date_of_birth >= DATE '1900-01-01'
      AND date_of_birth <= CURRENT_DATE - INTERVAL '13 years'
    )
  );

COMMIT;