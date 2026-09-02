'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, null)

  return (
    <div className="bg-card border border-hairline rounded-2xl p-6">
      <h1 className="text-lg font-medium text-ink">Create your account</h1>

      <form action={formAction} className="space-y-4 mt-5">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs text-zinc-600">Username</Label>
          <Input id="username" name="username" required minLength={3}
            placeholder="username" autoComplete="username" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs text-zinc-600">Email address</Label>
          <Input id="email" name="email" type="email" required
            placeholder="you@example.com" autoComplete="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs text-zinc-600">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8}
            autoComplete="new-password" />
          <p className="text-xs text-zinc-400">At least 8 characters.</p>
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{state.error}</p>
        )}

        <Button type="submit" disabled={isPending}
          className="w-full bg-ink hover:bg-zinc-800 rounded-full h-11">
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="text-ink font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )
}