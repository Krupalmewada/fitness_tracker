import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { id: workoutId } = await params

    const {
      exercise_id,
      set_number,
      reps = null,
      weight_kg = null,
      duration_seconds = null,
      distance_m = null,
    } = await request.json()

    if (!exercise_id || !set_number) {
      return Response.json(
        { error: 'exercise_id and set_number are required.' },
        { status: 400 }
      )
    }

    // Mirror the DB constraint in the app so the user gets a clear message
    // instead of a generic check violation. The constraint stays as the
    // guarantee; this is just a better error.
    if (reps === null && duration_seconds === null && distance_m === null) {
      return Response.json(
        { error: 'A set needs reps, duration, or distance.' },
        { status: 400 }
      )
    }

    // INSERT ... SELECT ... WHERE EXISTS: the row is only written if the
    // workout belongs to this user. Ownership check and insert in one
    // statement, so there's no gap between checking and writing.
    const [set] = await query(
      `INSERT INTO workout_sets
         (workout_id, exercise_id, set_number, reps, weight_kg, duration_seconds, distance_m)
       SELECT $1, $2, $3, $4, $5, $6, $7
        WHERE EXISTS (
          SELECT 1 FROM workouts WHERE id = $1 AND user_id = $8
        )
       RETURNING id, workout_id, exercise_id, set_number, reps,
                 weight_kg, duration_seconds, distance_m`,
      [workoutId, exercise_id, set_number, reps, weight_kg,
       duration_seconds, distance_m, user.id]
    )

    // No row inserted means the WHERE EXISTS failed - wrong owner, or no
    // such workout. Same 404 either way.
    if (!set) {
      return Response.json({ error: 'Workout not found.' }, { status: 404 })
    }

    return Response.json(set, { status: 201 })
  } catch (error) {
    // workout_sets_unique_set - same exercise, same set number, same workout.
    if (error.code === '23505') {
      return Response.json(
        { error: 'That set number already exists for this exercise.' },
        { status: 409 }
      )
    }
    if (error.code === '23503') {
      return Response.json({ error: 'Unknown exercise.' }, { status: 400 })
    }
    if (error.code === '23514') {
      return Response.json({ error: 'Invalid set data.' }, { status: 400 })
    }
    if (error.code === '22P02') {
      return Response.json({ error: 'Invalid id format.' }, { status: 400 })
    }
    console.error('Sets POST error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}