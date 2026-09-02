'use client'

import { useActionState, useState } from 'react'
import { createWeightAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function NewWeightDialog({ triggerLabel = '+ Log weight', triggerClassName }) {
  const [open, setOpen] = useState(false)

  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await createWeightAction(prevState, formData)
      if (result?.success) setOpen(false)
      return result
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Default is the header pill; the empty state passes a larger variant. */}
      <DialogTrigger
        className={
          triggerClassName ??
          'inline-flex items-center justify-center rounded-full bg-ink text-white text-sm font-medium h-10 px-5 hover:bg-zinc-800 transition-colors'
        }>
        {triggerLabel}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-ink">Log your weight</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input id="weight_kg" name="weight_kg" type="number" step="0.1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required
                defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_fat_percent">Body fat % (optional)</Label>
            <Input id="body_fat_percent" name="body_fat_percent" type="number" step="0.1" min="0" max="100" />
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
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}