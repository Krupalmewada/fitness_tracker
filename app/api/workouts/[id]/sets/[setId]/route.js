import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    // Two dynamic segments -> two keys on params.
    const { id: workoutId, setId } = await params

    // workout_sets has no user_id, so ownership is two levels deep:
    // set -> workout -> user. USING joins workouts into the DELETE so the
    // whole check happens in one statement.
    //
    // Requiring s.workout_id = $2 as well means a set id from a *different*
    // workout of yours won't delete via this URL either - the path has to
    // describe the row it's actually deleting.
    const deleted = await query(
      `DELETE FROM workout_sets s
        USING workouts w
        WHERE s.id = $1
          AND s.workout_id = $2
          AND w.id = s.workout_id
          AND w.user_id = $3
       RETURNING s.id`,
      [setId, workoutId, user.id]
    )

    if (deleted.length === 0) {
      return Response.json({ error: 'Set not found.' }, { status: 404 })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error.code === '22P02') {
      return Response.json({ error: 'Invalid id.' }, { status: 400 })
    }
    console.error('Set DELETE error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}