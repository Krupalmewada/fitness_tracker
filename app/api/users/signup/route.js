import bcrypt from 'bcrypt'
import { transaction } from '@/lib/db'
import { createSession } from '@/lib/session'
import {
  setSessionCookie,
  getRequestMetadata
} from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, username, password } = await request.json()

    // Validate required fields
    if (!email || !username || !password) {
      return Response.json(
        { error: 'Email, username, and password are required.' },
        { status: 400 }
      )
    }

    // Validate lengths
    if (username.trim().length < 3) {
      return Response.json(
        { error: 'Username must be at least 3 characters.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    // Normalise input
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim()

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(normalizedEmail)) {
      return Response.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Transaction
    const user = await transaction(async (client) => {
      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, username`,
        [normalizedEmail, normalizedUsername, passwordHash]
      )

      const newUser = userResult.rows[0]

      // Create empty user_data row
      await client.query(
        `INSERT INTO user_data (user_id)
         VALUES ($1)`,
        [newUser.id]
      )

      return newUser
    })

    // Auto-login
    const { userAgent, ip } = getRequestMetadata(request)

    const token = await createSession(
      user.id,
      userAgent,
      ip
    )

    await setSessionCookie(token)

    // Created
    return Response.json(user, { status: 201 })

  } catch (error) {

    // Unique constraint violations
    if (error.code === '23505') {
      if (error.constraint === 'users_email_unique') {
        return Response.json(
          { error: 'That email is already registered.' },
          { status: 409 }
        )
      }

      if (error.constraint === 'users_username_unique') {
        return Response.json(
          { error: 'That username is already taken.' },
          { status: 409 }
        )
      }

      return Response.json(
        { error: 'That account already exists.' },
        { status: 409 }
      )
    }

    // Check constraint violations
    if (error.code === '23514') {
      return Response.json(
        { error: 'Invalid data provided.' },
        { status: 400 }
      )
    }

    // Unexpected errors only
    console.error('Signup error:', error)

    return Response.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}