import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 50, 100)
    const offset = Math.max(Number(request.nextUrl.searchParams.get('offset')) || 0, 0)

    const workouts = await query(
      `SELECT w.id, w.duration_minutes, w.calories, w.calories_estimated,
              w.date, w.notes, w.created_at,
              wt.id AS workout_type_id, wt.name AS workout_type, wt.category
         FROM workouts w
         JOIN workout_types wt ON wt.id = w.workout_type_id
        WHERE w.user_id = $1
        ORDER BY w.date DESC, w.created_at DESC
        LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    )

    return Response.json(workouts)
  } catch (error) {
    console.error('Workouts GET error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const {
      workout_type_id,
      duration_minutes = null,
      calories = null,
      date,
      notes = null,
    } = await request.json()

    if (!workout_type_id || !date) {
      return Response.json(
        { error: 'workout_type_id and date are required.' },
        { status: 400 }
      )
    }

    let finalCalories = calories
    let estimated = false

    // If the user didn't supply calories, estimate from MET.
    // calories = MET x bodyweight(kg) x hours
    if (calories === null && duration_minutes) {
      const [row] = await query(
        `SELECT wt.met_value,
                (SELECT weight_kg
                   FROM weight_entries
                  WHERE user_id = $1
                  ORDER BY date DESC
                  LIMIT 1) AS weight_kg
           FROM workout_types wt
          WHERE wt.id = $2`,
        [user.id, workout_type_id]
      )

      if (row?.met_value && row?.weight_kg) {
        finalCalories = Math.round(
          Number(row.met_value) * Number(row.weight_kg) * (duration_minutes / 60)
        )
        estimated = true
      }
    }

    const [workout] = await query(
      `INSERT INTO workouts
         (user_id, workout_type_id, duration_minutes, calories, calories_estimated, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, workout_type_id, duration_minutes, calories,
                 calories_estimated, date, notes, created_at`,
      [user.id, workout_type_id, duration_minutes, finalCalories, estimated, date, notes]
    )

    return Response.json(workout, { status: 201 })
  } catch (error) {
    if (error.code === '23503') {
      return Response.json({ error: 'Unknown workout type.' }, { status: 400 })
    }
    if (error.code === '23514') {
      return Response.json({ error: 'Invalid workout data.' }, { status: 400 })
    }
    if (error.code === '22P02') {
      return Response.json({ error: 'Invalid id format.' }, { status: 400 })
    }
    console.error('Workouts POST error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}