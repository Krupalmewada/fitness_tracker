'use server'

import { redirect } from 'next/navigation'
import { destroySession } from '@/lib/auth'

export async function logoutAction() {
  // Deletes the session row AND clears the cookie - both matter.
  // Clearing only the cookie would leave a valid token alive for 30 days.
  await destroySession()

  // Outside any try/catch: redirect() signals by throwing.
  redirect('/login')
}