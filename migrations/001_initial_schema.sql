-- 001_initial_schema.sql
-- Initial schema for fitness_tracker
-- Author: Krupal | Created: 2026-08-12

-- Drop in reverse dependency order so foreign keys don't block us.
-- CASCADE also removes anything that depends on these tables.
BEGIN;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_data CASCADE;
DROP TABLE IF EXISTS workout_types CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS workout_sets CASCADE;
DROP TABLE IF EXISTS weight_entries CASCADE;
DROP TABLE IF EXISTS food_intake CASCADE;




CREATE TABLE users (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    email           varchar(255)    NOT NULL,
    username        varchar(50)     NOT NULL,
    password_hash   varchar(255)    NOT NULL,
    email_verified  boolean         NOT NULL DEFAULT false,
    created_at      timestamptz     NOT NULL DEFAULT now(),
    updated_at      timestamptz     NOT NULL DEFAULT now(),
    CONSTRAINT users_email_unique      UNIQUE (email),
    CONSTRAINT users_username_unique   UNIQUE (username),
    CONSTRAINT users_email_format      CHECK (email LIKE '%_@_%._%'),
    CONSTRAINT users_username_length   CHECK (char_length(username) >= 3)
);
COMMENT ON TABLE  users                IS 'Account credentials. Profile data lives in user_data.';
COMMENT ON COLUMN users.password_hash  IS 'bcrypt hash, cost factor 12.';



CREATE TABLE user_data(
    id                  uuid                    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid                    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    target_weight_kg	numeric(5,2)	        CHECK (target_weight_kg> 0),
    height_cm	        numeric(5,2)	        CHECK (height_cm> 0),
    sex	                varchar(20)	            CHECK (sex IN ('male','female','other','prefer_not_to_say')),
    date_of_birth	    date	                CHECK (date_of_birth <= CURRENT_DATE),
    activity_level	    varchar(20)	            CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
    created_at	        timestamptz	            NOT NULL DEFAULT now(),
    updated_at	        timestamptz	            NOT NULL DEFAULT now()

);


CREATE TABLE workout_types(
    id                  uuid                    PRIMARY KEY DEFAULT gen_random_uuid(),
    name                varchar(100)            NOT NULL UNIQUE,
    category            varchar(50)             NOT NULL CHECK (category IN ('cardio','strength','flexibility','sports','other')),
    met_value           numeric(4,2)            NOT NULL CHECK (met_value> 0),
    created_at          timestamptz             NOT NULL DEFAULT now()
);


CREATE TABLE exercises(
    id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    name           varchar(100)  NOT NULL UNIQUE,
    muscle_group   varchar(50)   ,
    equipment      varchar(50)   ,
    tracking_type  varchar(20)   NOT NULL CHECK (tracking_type IN ('reps_weight','duration','distance')),
    created_at     timestamptz   NOT NULL DEFAULT now()
);



CREATE TABLE workouts(
    id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_type_id     uuid         NOT NULL REFERENCES workout_types(id) ON DELETE RESTRICT,
    duration_minutes    integer      CHECK (duration_minutes > 0),
    calories            integer      CHECK (calories>= 0),
    calories_estimated  boolean      NOT NULL DEFAULT false,
    date                date         NOT NULL,
    notes               text         ,
    created_at          timestamptz  NOT NULL DEFAULT now(),
    updated_at          timestamptz  NOT NULL DEFAULT now()
);


CREATE TABLE workout_sets(
    id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id        uuid          NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id       uuid          NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    set_number        integer       NOT NULL CHECK (set_number > 0),
    reps              integer       CHECK (reps > 0),
    weight_kg         numeric(6,2)  CHECK (weight_kg >= 0),
    duration_seconds  integer       CHECK (duration_seconds > 0),
    distance_m        numeric(8,2)  CHECK (distance_m > 0),
    created_at        timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT workout_sets_unique_set UNIQUE (workout_id, exercise_id, set_number),
    CONSTRAINT workout_sets_not_null CHECK (reps IS NOT NULL OR duration_seconds IS NOT NULL OR distance_m IS NOT NULL)
    
);


CREATE TABLE weight_entries(
    id                 uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg          numeric(5,2)  NOT NULL CHECK (weight_kg> 0),
    body_fat_percent   numeric(4,2)  CHECK (body_fat_percent BETWEEN 0 AND 100),
    date               date          NOT NULL,
    notes              text          ,
    created_at         timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT weight_entries_one_per_day UNIQUE (user_id, date)
);


CREATE TABLE food_intake(
    id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food          varchar(255)  NOT NULL,
    quantity      numeric(7,2)  CHECK (quantity > 0),
    serving_unit  varchar(30)   ,
    meal_type     varchar(20)   NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
    calories      integer       CHECK (calories >= 0),
    protein_g     numeric(6,2)  CHECK (protein_g>= 0),
    carbs_g       numeric(6,2)  CHECK (carbs_g>= 0),
    fat_g         numeric(6,2)  CHECK (fat_g>= 0),
    date          date          NOT NULL,
    eaten_at      timestamptz   ,
    created_at    timestamptz   NOT NULL DEFAULT now()
);


CREATE INDEX idx_workouts_user_date       ON workouts (user_id, date DESC);
CREATE INDEX idx_weight_entries_user_date ON weight_entries (user_id, date DESC);
CREATE INDEX idx_food_intake_user_date    ON food_intake (user_id, date DESC);
CREATE INDEX idx_workout_sets_workout     ON workout_sets (workout_id);
CREATE INDEX idx_workout_sets_exercise    ON workout_sets (exercise_id);

COMMIT;
