import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Whitelist, not string interpolation. Never build SQL from user input.
const PERIODS = {
  today: '0 days',
  week: '7 days',
  month: '30 days',
  year: '365 days',
}

export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const requested = request.nextUrl.searchParams.get('period') ?? 'week'
    const interval = PERIODS[requested]

    if (!interval) {
      return Response.json(
        { error: `period must be one of: ${Object.keys(PERIODS).join(', ')}` },
        { status: 400 }
      )
    }

    // One round trip instead of four. Each subquery is scoped to this user
    // and this date window - "calories since the beginning of time" was useless.
    const [stats] = await query(
      `SELECT
         (SELECT COALESCE(SUM(calories), 0) FROM workouts
           WHERE user_id = $1 AND date >= CURRENT_DATE - $2::interval)  AS workout_calories,
         (SELECT COUNT(*) FROM workouts
           WHERE user_id = $1 AND date >= CURRENT_DATE - $2::interval)  AS workout_count,
         (SELECT COALESCE(SUM(duration_minutes), 0) FROM workouts
           WHERE user_id = $1 AND date >= CURRENT_DATE - $2::interval)  AS workout_minutes,
         (SELECT COALESCE(SUM(calories), 0) FROM food_intake
           WHERE user_id = $1 AND date >= CURRENT_DATE - $2::interval)  AS food_calories,
         (SELECT COALESCE(SUM(protein_g), 0) FROM food_intake
           WHERE user_id = $1 AND date >= CURRENT_DATE - $2::interval)  AS protein_g,
         (SELECT weight_kg FROM weight_entries
           WHERE user_id = $1 ORDER BY date DESC LIMIT 1)               AS current_weight_kg,
         (SELECT weight_kg FROM weight_entries
           WHERE user_id = $1 ORDER BY date ASC LIMIT 1)                AS starting_weight_kg,
         (SELECT target_weight_kg FROM user_data WHERE user_id = $1)    AS target_weight_kg`,
      [user.id, interval]
    )

    // SUM() and COUNT() come back as strings from pg (numeric/bigint are not
    // safely representable as JS numbers, so the driver refuses to guess).
    // Without Number(), food - workout would work but food + workout would concatenate.
    const workoutCalories = Number(stats.workout_calories)
    const foodCalories = Number(stats.food_calories)
    const currentWeight = stats.current_weight_kg === null ? null : Number(stats.current_weight_kg)
    const targetWeight = stats.target_weight_kg === null ? null : Number(stats.target_weight_kg)
    const startingWeight = stats.starting_weight_kg === null ? null : Number(stats.starting_weight_kg)

    return Response.json({
      period: requested,
      workouts: {
        count: Number(stats.workout_count),
        minutes: Number(stats.workout_minutes),
        caloriesBurned: workoutCalories,
      },
      nutrition: {
        caloriesConsumed: foodCalories,
        proteinG: Number(stats.protein_g),
      },
      netCalories: foodCalories - workoutCalories,
      weight: {
        current: currentWeight,
        starting: startingWeight,
        target: targetWeight,
        changeKg:
          currentWeight !== null && startingWeight !== null
            ? Number((currentWeight - startingWeight).toFixed(2))
            : null,
        toGoalKg:
          currentWeight !== null && targetWeight !== null
            ? Number((currentWeight - targetWeight).toFixed(2))
            : null,
      },
    })
  } catch (error) {
    console.error('Stats GET error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}