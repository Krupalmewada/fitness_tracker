import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    // A food log is a per-day view. Default to today.
    const date = request.nextUrl.searchParams.get('date')

    const entries = await query(
      `SELECT id, food, quantity, serving_unit, meal_type,
              calories, protein_g, carbs_g, fat_g, date, eaten_at
         FROM food_intake
        WHERE user_id = $1
          AND date = COALESCE($2::date, CURRENT_DATE)
        ORDER BY eaten_at NULLS LAST, created_at`,
      [user.id, date]
    )

    const totals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + Number(e.calories ?? 0),
        protein_g: acc.protein_g + Number(e.protein_g ?? 0),
        carbs_g: acc.carbs_g + Number(e.carbs_g ?? 0),
        fat_g: acc.fat_g + Number(e.fat_g ?? 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    )

    return Response.json({ entries, totals })
  } catch (error) {
    // A malformed ?date= is the caller's mistake, not a server fault.
    if (error.code === '22007' || error.code === '22008') {
      return Response.json({ error: 'Invalid date.' }, { status: 400 })
    }
    console.error('Food GET error:', error)
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
      food,
      quantity = null,
      serving_unit = null,
      meal_type,
      calories = null,
      protein_g = null,
      carbs_g = null,
      fat_g = null,
      date,
      eaten_at = null,
    } = await request.json()

    if (!food || !meal_type || !date) {
      return Response.json(
        { error: 'food, meal_type and date are required.' },
        { status: 400 }
      )
    }

    const [entry] = await query(
      `INSERT INTO food_intake
         (user_id, food, quantity, serving_unit, meal_type,
          calories, protein_g, carbs_g, fat_g, date, eaten_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, food, quantity, serving_unit, meal_type,
                 calories, protein_g, carbs_g, fat_g, date, eaten_at`,
      [user.id, food, quantity, serving_unit, meal_type,
       calories, protein_g, carbs_g, fat_g, date, eaten_at]
    )

    return Response.json(entry, { status: 201 })
  } catch (error) {
    if (error.code === '23514') {
      return Response.json(
        { error: 'Invalid food entry. Check meal_type.' },
        { status: 400 }
      )
    }
    if (error.code === '22P02' || error.code === '22007' || error.code === '22008') {
      return Response.json({ error: 'Invalid data format.' }, { status: 400 })
    }
    console.error('Food POST error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}