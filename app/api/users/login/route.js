import bcrypt from 'bcrypt'
import { query } from "../../../../lib/db"

export async function POST(request) {
  const { email, password } = await request.json()
  
 // 1. Get user by email only
const result = await query('SELECT * FROM users WHERE email = $1', [email])

// 2. Check if user exists
if(result.length === 0) return Response.json("email not exist", {status:401})

// 3. Compare passwords in JavaScript
const storedHash = result[0].password
const isMatch = await bcrypt.compare(password, storedHash)

// 4. If match, return user (without password)
if(isMatch) {
  const { id, email, created_at } = result[0]
  return Response.json({ id, email, created_at })
}
else return Response.json("password doesn't match", {status:401})
}