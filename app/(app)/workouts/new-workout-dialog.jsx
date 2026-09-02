'use client'

import { useActionState, useState } from 'react'
import { createWorkoutAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export function NewWorkoutDialog({ types, triggerLabel = '+ Log workout', triggerClassName }) {
  const [open, setOpen] = useState(false)

  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await createWorkoutAction(prevState, formData)
      if (result?.success) setOpen(false)
      return result
    },
    null
  )

  // Group by category so the dropdown reads as Cardio / Strength / ...
  // rather than one long list in an ordering nobody can infer.
  const grouped = types.reduce((acc, t) => {
    (acc[t.category] ??= []).push(t)
    return acc
  }, {})

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          triggerClassName ??
          'inline-flex items-center justify-center rounded-full bg-ink text-white text-sm font-medium h-10 px-5 hover:bg-zinc-800 transition-colors'
        }>
        {triggerLabel}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-ink">Log a workout</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout_type_id">Type</Label>
            <select
              id="workout_type_id"
              name="workout_type_id"
              required
              className="w-full h-10 rounded-xl border border-hairline px-3 text-sm bg-white"
            >
              {Object.entries(grouped).map(([category, items]) => (
                <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                  {items.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required
                defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Minutes</Label>
              <Input id="duration_minutes" name="duration_minutes" type="number" min="1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calories</Label>
            <Input id="calories" name="calories" type="number" min="0" />
            <p className="text-xs text-zinc-400">
              Leave blank and we&apos;ll estimate it from your weight and duration.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}
            className="w-full bg-ink hover:bg-zinc-800 rounded-full">
            {isPending ? 'Saving…' : 'Save workout'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}