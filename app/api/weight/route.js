import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 90, 365)

    const entries = await query(
      `SELECT id, weight_kg, body_fat_percent, date, notes, created_at
         FROM weight_entries
        WHERE user_id = $1
        ORDER BY date DESC
        LIMIT $2`,
      [user.id, limit]
    )

    return Response.json(entries)
  } catch (error) {
    console.error('Weight GET error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { weight_kg, body_fat_percent = null, date, notes = null } =
      await request.json()

    if (!weight_kg || !date) {
      return Response.json(
        { error: 'weight_kg and date are required.' },
        { status: 400 }
      )
    }

    const [entry] = await query(
      `INSERT INTO weight_entries (user_id, weight_kg, body_fat_percent, date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, weight_kg, body_fat_percent, date, notes, created_at`,
      [user.id, weight_kg, body_fat_percent, date, notes]
    )

    return Response.json(entry, { status: 201 })
  } catch (error) {
    // weight_entries_one_per_day - the constraint you named yourself.
    if (error.code === '23505') {
      return Response.json(
        { error: 'You already logged a weight for that date.' },
        { status: 409 }
      )
    }
    if (error.code === '23514') {
      return Response.json({ error: 'Invalid weight data.' }, { status: 400 })
    }
    console.error('Weight POST error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}