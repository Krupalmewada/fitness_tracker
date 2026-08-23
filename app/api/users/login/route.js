import bcrypt from 'bcrypt'
import { query } from '@/lib/db'
import { createSession } from '@/lib/session'
import { setSessionCookie } from '@/lib/auth'
const DUMMY_HASH = '$2b$10$VW7k92vF7HS0E/XBt1PjCugLHTRi7CIxgzH0KjqUCeb3seEleBxYK'
export async function POST(request) {
  try {
    const { email, password } = await request.json()
    // 1. Validate required fields
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }
    // 2. Normalise email
    const normalizedEmail = email.trim().toLowerCase()
    // 3. Get only the columns we need
    const result = await query(
      `SELECT id, email, username, password_hash
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    )
    const user = result[0]
    // 4. Always run bcrypt.compare
    const hash = user?.password_hash ?? DUMMY_HASH
    const isMatch = await bcrypt.compare(password, hash)
    // 5. Generic error for both cases
    if (!user || !isMatch) {
      return Response.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }
    // 6. Get user agent and IP
    const userAgent = request.headers.get('user-agent')
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : null
    // 7. Create session token
    const token = await createSession(user.id, userAgent, ip)
    // 8. Set cookie
    await setSessionCookie(token)
    // 9. Never return password_hash
    return Response.json({
      id: user.id,
      email: user.email,
      username: user.username
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}