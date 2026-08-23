import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    // Optional filters for the UI - a "chest" tab, or only reps/weight moves.
    const muscleGroup = request.nextUrl.searchParams.get('muscle_group')
    const trackingType = request.nextUrl.searchParams.get('tracking_type')

    // Passing null for a filter makes that condition always true, so one
    // query covers all four combinations. Beats building SQL with string
    // concatenation, which is how injection bugs get written.
    const exercises = await query(
      `SELECT id, name, muscle_group, equipment, tracking_type
         FROM exercises
        WHERE ($1::text IS NULL OR muscle_group = $1)
          AND ($2::text IS NULL OR tracking_type = $2)
        ORDER BY muscle_group, name`,
      [muscleGroup, trackingType]
    )

    return Response.json(exercises)
  } catch (error) {
    console.error('Exercises GET error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}