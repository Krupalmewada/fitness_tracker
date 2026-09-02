'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="bg-card border border-hairline rounded-2xl p-6">
      <h1 className="text-lg font-medium text-ink">Sign in to your account</h1>

      <form action={formAction} className="space-y-4 mt-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs text-zinc-600">Email address</Label>
          <Input id="email" name="email" type="email" required
            placeholder="you@example.com" autoComplete="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs text-zinc-600">Password</Label>
          <Input id="password" name="password" type="password" required
            autoComplete="current-password" />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{state.error}</p>
        )}

        <Button type="submit" disabled={isPending}
          className="w-full bg-ink hover:bg-zinc-800 rounded-full h-11">
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-ink font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  )
}