import { query } from "../../../../lib/db"

export async function GET(request) {
  const userId = request.nextUrl.searchParams.get('userId')
  
  if(!userId) return Response.json({ error: "userId required" }, { status: 400 })
  const result = await query(`SELECT * FROM user_data WHERE user_id=$1`, [userId])
  if(result.length === 0) return Response.json({ error: "Profile not found" }, { status: 404 })
  return Response.json(result[0])
}

export async function PUT(request) {
   const { userId, weight_loss_goal, height, sex, current_weight } = await request.json()
  
  if(!userId) return Response.json({ error: "userId required" }, { status: 400 })
  
  const result = await query(
    `UPDATE user_data SET weight_loss_goal=$1, height=$2, sex=$3, current_weight=$4 WHERE user_id=$5 RETURNING *`,
    [weight_loss_goal, height, sex, current_weight, userId]
  )
  
  if(result.length === 0) return Response.json({ error: "Profile not found" }, { status: 404 })
  
  return Response.json(result[0])
}