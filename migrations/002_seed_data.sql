-- 002_seed_data.sql
-- Reference data: workout types (with MET values) and the exercise catalogue.
-- Tuned to commopn equipment: Star Trac selectorized machines, Smith machine,
-- dumbbells 5-75 lb, cardio floor.
-- Author: Krupal | Created: 2026-08-13

BEGIN;
-- Re-runnable: clear reference data before re-seeding.
-- DELETE (not TRUNCATE) so foreign keys from workouts/workout_sets are respected --
-- if anything references these rows, this fails loudly instead of destroying data.
DELETE FROM exercises;
DELETE FROM workout_types;
-- MET = Metabolic Equivalent of Task. 1 MET = at rest.
-- calories ~= MET x bodyweight_kg x hours
-- Values approximated from the Compendium of Physical Activities.
INSERT INTO workout_types (name, category, met_value) VALUES
    ('Walking',            'cardio',      3.5),
    ('Running',            'cardio',      9.8),
    ('Cycling',            'cardio',      8.0),
    ('Swimming',           'cardio',      7.0),
    ('Hiking',             'cardio',      6.0),
    ('Rowing',             'cardio',      7.0),
    ('Elliptical',         'cardio',      5.0),
    ('Stair Climber',      'cardio',      9.0),
    ('HIIT',               'cardio',      8.0),
    ('Strength Training',  'strength',    5.0),
    ('Yoga',               'flexibility', 2.5),
    ('Stretching',         'flexibility', 2.3),
    ('Sports',             'sports',      7.0),
    ('Other',              'other',       4.0);



INSERT INTO exercises (name, muscle_group, equipment, tracking_type) VALUES
    -- Chest
    ('Chest Press Machine',          'chest',      'machine',       'reps_weight'),
    ('Incline Chest Press Machine',  'chest',      'machine',       'reps_weight'),
    ('Pec Deck Fly',                 'chest',      'machine',       'reps_weight'),
    ('Cable Crossover',              'chest',      'cable',         'reps_weight'),
    ('Dumbbell Bench Press',         'chest',      'dumbbell',      'reps_weight'),
    ('Incline Dumbbell Press',       'chest',      'dumbbell',      'reps_weight'),
    ('Smith Machine Bench Press',    'chest',      'smith machine', 'reps_weight'),
    ('Push-Up',                      'chest',      'bodyweight',    'reps_weight'),

    -- Back
    ('Lat Pulldown',                 'back',       'machine',       'reps_weight'),
    ('Seated Cable Row',             'back',       'machine',       'reps_weight'),
    ('Assisted Pull-Up',             'back',       'machine',       'reps_weight'),
    ('Dumbbell Row',                 'back',       'dumbbell',      'reps_weight'),
    ('Smith Machine Row',            'back',       'smith machine', 'reps_weight'),
    ('Back Extension',               'back',       'machine',       'reps_weight'),
    ('Dumbbell Shrug',               'traps',      'dumbbell',      'reps_weight'),

    -- Shoulders
    ('Shoulder Press Machine',       'shoulders',  'machine',       'reps_weight'),
    ('Dumbbell Shoulder Press',      'shoulders',  'dumbbell',      'reps_weight'),
    ('Dumbbell Lateral Raise',       'shoulders',  'dumbbell',      'reps_weight'),
    ('Cable Face Pull',              'shoulders',  'cable',         'reps_weight'),
    ('Smith Machine Shoulder Press', 'shoulders',  'smith machine', 'reps_weight'),

    -- Arms
    ('Bicep Curl Machine',           'biceps',     'machine',       'reps_weight'),
    ('Dumbbell Bicep Curl',          'biceps',     'dumbbell',      'reps_weight'),
    ('Hammer Curl',                  'biceps',     'dumbbell',      'reps_weight'),
    ('Tricep Pushdown',              'triceps',    'cable',         'reps_weight'),
    ('Tricep Extension Machine',     'triceps',    'machine',       'reps_weight'),
    ('Overhead Dumbbell Extension',  'triceps',    'dumbbell',      'reps_weight'),

    -- Legs
    ('Leg Press',                    'legs',       'machine',       'reps_weight'),
    ('Leg Extension',                'quads',      'machine',       'reps_weight'),
    ('Seated Leg Curl',              'hamstrings', 'machine',       'reps_weight'),
    ('Smith Machine Squat',          'legs',       'smith machine', 'reps_weight'),
    ('Goblet Squat',                 'legs',       'dumbbell',      'reps_weight'),
    ('Dumbbell Lunge',               'legs',       'dumbbell',      'reps_weight'),
    ('Dumbbell Romanian Deadlift',   'hamstrings', 'dumbbell',      'reps_weight'),
    ('Hip Abduction Machine',        'glutes',     'machine',       'reps_weight'),
    ('Hip Adduction Machine',        'legs',       'machine',       'reps_weight'),
    ('Calf Raise Machine',           'calves',     'machine',       'reps_weight'),

    -- Core
    ('Ab Crunch Machine',            'core',       'machine',       'reps_weight'),
    ('Decline Sit-Up',               'core',       'bodyweight',    'reps_weight'),
    ('Hanging Leg Raise',            'core',       'bodyweight',    'reps_weight'),
    ('Plank',                        'core',       'bodyweight',    'duration'),

    -- Cardio floor
    ('Treadmill Run',                'full body',  'cardio machine', 'distance'),
    ('Treadmill Walk',               'full body',  'cardio machine', 'distance'),
    ('Stationary Bike',              'full body',  'cardio machine', 'distance'),
    ('Elliptical',                   'full body',  'cardio machine', 'duration'),
    ('Stair Climber',                'full body',  'cardio machine', 'duration'),
    ('Rowing Machine',               'full body',  'cardio machine', 'distance'),

    -- Catch-all for anything not listed above.
    ('Other',                        'other',      'other',          'reps_weight');

COMMIT;