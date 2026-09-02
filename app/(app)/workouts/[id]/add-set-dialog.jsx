'use client'

import { useActionState, useState } from 'react'
import { addSetAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const selectClass = 'w-full h-10 rounded-xl border border-hairline px-3 text-sm bg-white'

export function AddSetDialog({ workoutId, exercises, existingSets }) {
  const [open, setOpen] = useState(false)

  const firstId = exercises[0]?.id ?? ''
  const nextFor = (id) => existingSets.filter((s) => s.exercise_id === id).length + 1

  const [exerciseId, setExerciseId] = useState(firstId)
  // Controlled, because the suggested number has to change when the exercise
  // does. defaultValue only applies on mount, so it can't do that.
  const [setNumber, setSetNumber] = useState(nextFor(firstId))

  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await addSetAction(prevState, formData)
      if (result?.success) setOpen(false)
      return result
    },
    null
  )

  // This is why the component is a client component: the form changes shape
  // depending on what the chosen exercise tracks. tracking_type is the
  // schema decision from day one, doing real work in the UI.
  const selected = exercises.find((e) => e.id === exerciseId)
  const tracking = selected?.tracking_type ?? 'reps_weight'

  // Grouped so 47 exercises don't arrive as one flat list.
  const grouped = exercises.reduce((acc, e) => {
    (acc[e.muscle_group ?? 'other'] ??= []).push(e)
    return acc
  }, {})

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-full bg-ink text-white text-sm font-medium h-10 px-5 hover:bg-zinc-800 transition-colors">
        + Add set
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-ink">Add a set</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="workout_id" value={workoutId} />

          <div className="space-y-2">
            <Label htmlFor="exercise_id">Exercise</Label>
            <select
              id="exercise_id"
              name="exercise_id"
              required
              className={selectClass}
              value={exerciseId}
              onChange={(e) => {
                const id = e.target.value
                setExerciseId(id)
                setSetNumber(nextFor(id))
              }}
            >
              {Object.entries(grouped).map(([group, items]) => (
                <optgroup key={group} label={group.charAt(0).toUpperCase() + group.slice(1)}>
                  {items.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="set_number">Set number</Label>
            <Input id="set_number" name="set_number" type="number" min="1" required
              value={setNumber}
              onChange={(e) => setSetNumber(e.target.value)} />
          </div>

          {tracking === 'reps_weight' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input id="reps" name="reps" type="number" min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input id="weight_kg" name="weight_kg" type="number" step="0.5" min="0" />
              </div>
            </div>
          )}

          {tracking === 'duration' && (
            <div className="space-y-2">
              <Label htmlFor="duration_seconds">Duration (seconds)</Label>
              <Input id="duration_seconds" name="duration_seconds" type="number" min="1" required />
            </div>
          )}

          {tracking === 'distance' && (
            <div className="space-y-2">
              <Label htmlFor="distance_m">Distance (metres)</Label>
              <Input id="distance_m" name="distance_m" type="number" step="1" min="1" required />
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}
            className="w-full bg-ink hover:bg-zinc-800 rounded-full">
            {isPending ? 'Saving…' : 'Add set'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}