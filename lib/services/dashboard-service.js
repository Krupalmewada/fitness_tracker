import { query } from '@/lib/db'

// Whitelist, not interpolation - the value reaching SQL is one we chose.
const PERIODS = { today: 0, week: 7, month: 30 }

export function isValidPeriod(period) {
  return Object.hasOwn(PERIODS, period)
}

export async function getDashboardData(userId, period = 'today') {
  const days = PERIODS[period] ?? 0

  const [[stats], workouts, weights] = await Promise.all([
    // CURRENT_DATE - <int> is date arithmetic in Postgres: 0 gives today only,
    // 7 gives the last week. One query shape covers every period.
    query(
      `SELECT
         (SELECT COALESCE(SUM(calories), 0) FROM workouts
           WHERE user_id = $1 AND date >= CURRENT_DATE - $2::int)      AS burned,
         (SELECT COALESCE(SUM(calories), 0) FROM food_intake
           WHERE user_id = $1 AND date >= CURRENT_DATE - $2::int)      AS eaten,
         (SELECT COUNT(*) FROM workouts
           WHERE user_id = $1 AND date >= CURRENT_DATE - $2::int)      AS sessions,
         (SELECT weight_kg FROM weight_entries
           WHERE user_id = $1 ORDER BY date DESC LIMIT 1)              AS weight`,
      [userId, days]
    ),
    // Deliberately NOT scoped to the period - this panel is "the last few
    // things you did", and an empty dashboard on a rest day is worse than
    // one that shows slightly older entries. Hence the label "Latest".
    query(
      `SELECT w.id, w.duration_minutes, w.calories, w.date,
              wt.name AS workout_type, wt.category
         FROM workouts w
         JOIN workout_types wt ON wt.id = w.workout_type_id
        WHERE w.user_id = $1
        ORDER BY w.date DESC, w.created_at DESC
        LIMIT 5`,
      [userId]
    ),
    query(
      `SELECT weight_kg, date FROM weight_entries
        WHERE user_id = $1 ORDER BY date ASC LIMIT 30`,
      [userId]
    ),
  ])

  const burned = Number(stats.burned)
  const eaten = Number(stats.eaten)

  return {
    period,
    burned,
    eaten,
    net: eaten - burned,
    sessions: Number(stats.sessions),
    weight: stats.weight,
    workouts,
    weights,
  }
}