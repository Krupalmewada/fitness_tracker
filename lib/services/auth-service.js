import bcrypt from 'bcrypt'
import { query, transaction } from '@/lib/db'
import { createSession } from '@/lib/session'

const DUMMY_HASH = '$2b$10$VW7k92vF7HS0E/XBt1PjCugLHTRi7CIxgzH0KjqUCeb3seEleBxYK'
const MIN_PASSWORD = 8
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Thrown for anything the user is allowed to see. Everything else
// bubbles up as a real error and becomes a 500.
export class AuthError extends Error {}

export async function loginUser({ email, password, userAgent = null, ip = null }) {
  if (!email || !password) {
    throw new AuthError('Email and password are required.')
  }

  const [user] = await query(
    `SELECT id, email, username, password_hash FROM users WHERE email = $1`,
    [email.trim().toLowerCase()]
  )

  // Compare against a dummy hash when the user doesn't exist, so both paths
  // take the same time. Otherwise response timing leaks which emails are real.
  const isMatch = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)

  if (!user || !isMatch) {
    throw new AuthError('Invalid email or password.')
  }

  const token = await createSession(user.id, userAgent, ip)

  return {
    token,
    user: { id: user.id, email: user.email, username: user.username },
  }
}

export async function registerUser({ email, username, password, userAgent = null, ip = null }) {
  if (!email || !username || !password) {
    throw new AuthError('Email, username and password are required.')
  }
  if (username.trim().length < 3) {
    throw new AuthError('Username must be at least 3 characters.')
  }
  if (password.length < MIN_PASSWORD) {
    throw new AuthError(`Password must be at least ${MIN_PASSWORD} characters.`)
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new AuthError('Please enter a valid email address.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  let user
  try {
    // Both inserts or neither. A user with no profile row would 404 on
    // every profile lookup, forever.
    user = await transaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, username`,
        [normalizedEmail, username.trim(), passwordHash]
      )
      const created = rows[0]

      await client.query(`INSERT INTO user_data (user_id) VALUES ($1)`, [created.id])

      return created
    })
  } catch (error) {
    // The constraint names you chose, turned into messages a user can act on.
    // Catching the violation rather than pre-checking also closes the race
    // where two signups with the same email arrive at once.
    if (error.code === '23505') {
      if (error.constraint === 'users_email_unique') {
        throw new AuthError('That email is already registered.')
      }
      if (error.constraint === 'users_username_unique') {
        throw new AuthError('That username is already taken.')
      }
      throw new AuthError('That account already exists.')
    }
    throw error
  }

  const token = await createSession(user.id, userAgent, ip)

  return { token, user }
}