import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    // In Next 15+, params is a Promise. Destructuring it without await
    // silently gives you undefined, and your query matches nothing.
    const { id } = await params

    // user_id in the WHERE is the ownership check. Without it, anyone could
    // read any workout by guessing an id - the IDOR again, one level down.
    // A URL parameter is no more trustworthy than a query string was.
    const [workout] = await query(
      `SELECT w.id, w.duration_minutes, w.calories, w.calories_estimated,
              w.date, w.notes, w.created_at,
              wt.id AS workout_type_id, wt.name AS workout_type, wt.category
         FROM workouts w
         JOIN workout_types wt ON wt.id = w.workout_type_id
        WHERE w.id = $1 AND w.user_id = $2`,
      [id, user.id]
    )

    // 404, not 403. Telling someone "that exists but isn't yours" confirms
    // the id is real. Say nothing.
    if (!workout) {
      return Response.json({ error: 'Workout not found.' }, { status: 404 })
    }

    const sets = await query(
      `SELECT s.id, s.set_number, s.reps, s.weight_kg,
              s.duration_seconds, s.distance_m,
              e.id AS exercise_id, e.name AS exercise, e.muscle_group, e.tracking_type
         FROM workout_sets s
         JOIN exercises e ON e.id = s.exercise_id
        WHERE s.workout_id = $1
        ORDER BY e.name, s.set_number`,
      [id]
    )

    return Response.json({ ...workout, sets })
  } catch (error) {
    if (error.code === '22P02') {
      return Response.json({ error: 'Invalid workout id.' }, { status: 400 })
    }
    console.error('Workout GET error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { id } = await params

    // Ownership is enforced in the WHERE clause, so a wrong user deletes
    // nothing and gets a 404. No separate fetch-then-check needed.
    const deleted = await query(
      `DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, user.id]
    )

    if (deleted.length === 0) {
      return Response.json({ error: 'Workout not found.' }, { status: 404 })
    }

    // The sets went too - workout_sets.workout_id is ON DELETE CASCADE.
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error.code === '22P02') {
      return Response.json({ error: 'Invalid workout id.' }, { status: 400 })
    }
    console.error('Workout DELETE error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}