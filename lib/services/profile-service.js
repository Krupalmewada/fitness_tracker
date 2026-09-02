import { query } from '@/lib/db'

export async function getProfile(userId) {
  const [profile] = await query(
    `SELECT target_weight_kg, height_cm, sex, date_of_birth, activity_level
       FROM user_data
      WHERE user_id = $1`,
    [userId]
  )
  return profile ?? null
}

export async function updateProfile(userId, input) {
  const { target_weight_kg, height_cm, sex, date_of_birth, activity_level } = input

  // COALESCE: use the new value if one was sent, otherwise keep what's stored.
  const [profile] = await query(
    `UPDATE user_data
        SET target_weight_kg = COALESCE($1, target_weight_kg),
            height_cm        = COALESCE($2, height_cm),
            sex              = COALESCE($3, sex),
            date_of_birth    = COALESCE($4, date_of_birth),
            activity_level   = COALESCE($5, activity_level)
      WHERE user_id = $6
      RETURNING target_weight_kg, height_cm, sex, date_of_birth, activity_level`,
    [target_weight_kg, height_cm, sex, date_of_birth, activity_level, userId]
  )
  return profile
}