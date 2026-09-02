'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { loginUser, AuthError } from '@/lib/services/auth-service'
import { setSessionCookie } from '@/lib/auth'

export async function loginAction(prevState, formData) {
  try {
    const headerList = await headers()
    const forwardedFor = headerList.get('x-forwarded-for')

    const { token } = await loginUser({
      email: formData.get('email'),
      password: formData.get('password'),
      userAgent: headerList.get('user-agent'),
      ip: forwardedFor ? forwardedFor.split(',')[0].trim() : null,
    })

    await setSessionCookie(token)
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message }
    }
    console.error('Login action error:', error)
    return { error: 'Something went wrong. Try again.' }
  }

  // redirect() works by throwing, so it must sit OUTSIDE the try block -
  // inside, your own catch would swallow it and the redirect never happens.
  redirect('/dashboard')
}