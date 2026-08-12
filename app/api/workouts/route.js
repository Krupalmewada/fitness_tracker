import { query } from "../../../../lib/db";
export async function POST(request){
    const {user_id, type, duration, calories, date} = await request.json()
    const result = query(`INSERT INTO workouts (user_id, type, duration, calories, date) VALUES ($1,$2,$3,$4,$5) RETURNING *`,[user_id, type, duration, calories, date])
    return Response.json(result[0])
}
export async function GET(request){
    const userId = request.nextUrl.searchParams.get("userId")
    const result = await query(`SELECT * FROM workouts WHERE user_id  = $1`,[userId])
    return Response.json(result[0])
}