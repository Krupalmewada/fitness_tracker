'use client'

import { useActionState, useState } from 'react'
import { createFoodAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack']

export function NewFoodDialog({ date }) {
  const [open, setOpen] = useState(false)

  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await createFoodAction(prevState, formData)
      if (result?.success) setOpen(false)
      return result
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-full bg-ink text-white text-sm font-medium h-10 px-5 hover:bg-zinc-800 transition-colors">
  + Add food
</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-emerald-900">Add food</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Keeps the entry on the day you're viewing, not today. */}
          <input type="hidden" name="date" value={date} />

          <div className="space-y-2">
            <Label htmlFor="food">Food</Label>
            <Input id="food" name="food" required placeholder="Chicken breast" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Amount</Label>
              <Input id="quantity" name="quantity" type="number" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serving_unit">Unit</Label>
              <Input id="serving_unit" name="serving_unit" placeholder="g" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal_type">Meal</Label>
              <select id="meal_type" name="meal_type" required
                className="w-full h-10 rounded-xl border border-emerald-200 px-3 text-sm bg-white capitalize">
                {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="calories">Kcal</Label>
              <Input id="calories" name="calories" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein_g">Protein</Label>
              <Input id="protein_g" name="protein_g" type="number" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs_g">Carbs</Label>
              <Input id="carbs_g" name="carbs_g" type="number" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat_g">Fat</Label>
              <Input id="fat_g" name="fat_g" type="number" step="0.1" />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700">
            {isPending ? 'Saving…' : 'Add'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}