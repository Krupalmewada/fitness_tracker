import { query } from '@/lib/db'

export function listWorkouts(userId, limit = 50) {
  return query(
    `SELECT w.id, w.duration_minutes, w.calories, w.calories_estimated,
            w.date, w.notes, wt.name AS workout_type, wt.category
       FROM workouts w
       JOIN workout_types wt ON wt.id = w.workout_type_id
      WHERE w.user_id = $1
      ORDER BY w.date DESC, w.created_at DESC
      LIMIT $2`,
    [userId, limit]
  )
}

export function listWorkoutTypes() {
  return query(`SELECT id, name, category FROM workout_types ORDER BY category, name`)
}

export async function createWorkout(userId, input) {
  const { workout_type_id, duration_minutes, calories, date, notes } = input

  let finalCalories = calories
  let estimated = false

  if (calories == null && duration_minutes) {
    const [row] = await query(
      `SELECT wt.met_value,
              (SELECT weight_kg FROM weight_entries
                WHERE user_id = $1 ORDER BY date DESC LIMIT 1) AS weight_kg
         FROM workout_types wt WHERE wt.id = $2`,
      [userId, workout_type_id]
    )

    if (row?.met_value && row?.weight_kg) {
      finalCalories = Math.round(row.met_value * row.weight_kg * (duration_minutes / 60))
      estimated = true
    }
  }

  const [workout] = await query(
    `INSERT INTO workouts
       (user_id, workout_type_id, duration_minutes, calories, calories_estimated, date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [userId, workout_type_id, duration_minutes, finalCalories, estimated, date, notes]
  )

  return workout
}

export function deleteWorkout(userId, workoutId) {
  return query(
    `DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING id`,
    [workoutId, userId]
  )
}
export async function getWorkoutWithSets(userId, workoutId) {
  // Ownership in the WHERE, so a workout that isn't yours simply isn't found.
  const [workout] = await query(
    `SELECT w.id, w.duration_minutes, w.calories, w.calories_estimated,
            w.date, w.notes, wt.name AS workout_type, wt.category
       FROM workouts w
       JOIN workout_types wt ON wt.id = w.workout_type_id
      WHERE w.id = $1 AND w.user_id = $2`,
    [workoutId, userId]
  )

  if (!workout) return null

  const sets = await query(
    `SELECT s.id, s.set_number, s.reps, s.weight_kg,
            s.duration_seconds, s.distance_m,
            e.id AS exercise_id, e.name AS exercise,
            e.muscle_group, e.tracking_type
       FROM workout_sets s
       JOIN exercises e ON e.id = s.exercise_id
      WHERE s.workout_id = $1
      ORDER BY e.name, s.set_number`,
    [workoutId]
  )

  return { ...workout, sets }
}

export function listExercises() {
  return query(
    `SELECT id, name, muscle_group, tracking_type
       FROM exercises
      ORDER BY muscle_group, name`
  )
}

export async function addSet(userId, workoutId, input) {
  const { exercise_id, set_number, reps, weight_kg, duration_seconds, distance_m } = input

  // INSERT ... SELECT ... WHERE EXISTS: the row is only written if the
  // workout belongs to this user. Check and write in one statement, so
  // there's no window between them.
  const [set] = await query(
    `INSERT INTO workout_sets
       (workout_id, exercise_id, set_number, reps, weight_kg, duration_seconds, distance_m)
     SELECT $1, $2, $3, $4, $5, $6, $7
      WHERE EXISTS (SELECT 1 FROM workouts WHERE id = $1 AND user_id = $8)
     RETURNING id`,
    [workoutId, exercise_id, set_number, reps, weight_kg, duration_seconds, distance_m, userId]
  )

  return set ?? null
}

export function deleteSet(userId, workoutId, setId) {
  // workout_sets has no user_id, so ownership is two levels deep:
  // set -> workout -> user. USING joins workouts into the DELETE.
  return query(
    `DELETE FROM workout_sets s
      USING workouts w
      WHERE s.id = $1
        AND s.workout_id = $2
        AND w.id = s.workout_id
        AND w.user_id = $3
     RETURNING s.id`,
    [setId, workoutId, userId]
  )
}