import { query } from '@/lib/db'

export function listWeights(userId, limit = 90) {
  return query(
    `SELECT id, weight_kg, body_fat_percent, date, notes
       FROM weight_entries
      WHERE user_id = $1
      ORDER BY date DESC
      LIMIT $2`,
    [userId, limit]
  )
}

export function createWeight(userId, { weight_kg, body_fat_percent, date, notes }) {
  return query(
    `INSERT INTO weight_entries (user_id, weight_kg, body_fat_percent, date, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, weight_kg, body_fat_percent, date, notes]
  )
}

export function deleteWeight(userId, id) {
  return query(
    `DELETE FROM weight_entries WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  )
}