import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    // The user comes from the session cookie, never from the request.
    // Nothing the client sends can change which profile this returns.
    const user = await getCurrentUser()

    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const result = await query(
      `SELECT target_weight_kg, height_cm, sex, date_of_birth, activity_level
       FROM user_data
       WHERE user_id = $1`,
      [user.id]
    )

    if (result.length === 0) {
      return Response.json({ error: 'Profile not found.' }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    console.error('Profile GET error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    // Default to null, not undefined. A missing key destructures to undefined,
    // and node-postgres rejects undefined parameters outright.
    // null is what COALESCE needs to mean "leave this column alone".
    const {
      target_weight_kg = null,
      height_cm = null,
      sex = null,
      date_of_birth = null,
      activity_level = null,
    } = await request.json()

    // COALESCE($n, column) => use the new value if one was sent,
    // otherwise keep whatever is already stored. That's the partial update.
    const result = await query(
      `UPDATE user_data
          SET target_weight_kg = COALESCE($1, target_weight_kg),
              height_cm        = COALESCE($2, height_cm),
              sex              = COALESCE($3, sex),
              date_of_birth    = COALESCE($4, date_of_birth),
              activity_level   = COALESCE($5, activity_level)
        WHERE user_id = $6
        RETURNING target_weight_kg, height_cm, sex, date_of_birth, activity_level`,
      [target_weight_kg, height_cm, sex, date_of_birth, activity_level, user.id]
    )

    if (result.length === 0) {
      return Response.json({ error: 'Profile not found.' }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    // CHECK violation: bad sex, bad activity_level, or a future date_of_birth.
    if (error.code === '23514') {
      return Response.json({ error: 'Invalid profile data.' }, { status: 400 })
    }

    console.error('Profile PUT error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}