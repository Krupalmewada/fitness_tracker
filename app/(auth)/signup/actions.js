'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { registerUser, AuthError } from '@/lib/services/auth-service'
import { setSessionCookie } from '@/lib/auth'

export async function signupAction(prevState, formData) {
  try {
    const headerList = await headers()
    const forwardedFor = headerList.get('x-forwarded-for')

    const { token } = await registerUser({
      email: formData.get('email'),
      username: formData.get('username'),
      password: formData.get('password'),
      userAgent: headerList.get('user-agent'),
      ip: forwardedFor ? forwardedFor.split(',')[0].trim() : null,
    })

    await setSessionCookie(token)
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message }
    console.error('Signup action error:', error)
    return { error: 'Something went wrong. Try again.' }
  }

  redirect('/dashboard')
}