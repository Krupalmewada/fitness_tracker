import { query } from '@/lib/db'

export function listFoodForDate(userId, date) {
  return query(
    `SELECT id, food, quantity, serving_unit, meal_type,
            calories, protein_g, carbs_g, fat_g, date
       FROM food_intake
      WHERE user_id = $1 AND date = $2::date
      ORDER BY created_at`,
    [userId, date]
  )
}

export function createFood(userId, input) {
  const { food, quantity, serving_unit, meal_type,
          calories, protein_g, carbs_g, fat_g, date } = input

  return query(
    `INSERT INTO food_intake
       (user_id, food, quantity, serving_unit, meal_type,
        calories, protein_g, carbs_g, fat_g, date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [userId, food, quantity, serving_unit, meal_type,
     calories, protein_g, carbs_g, fat_g, date]
  )
}

export function deleteFood(userId, id) {
  return query(
    `DELETE FROM food_intake WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  )
}