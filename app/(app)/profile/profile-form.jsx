'use client'

import { useActionState } from 'react'
import { updateProfileAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SEXES = [
  ['', 'Prefer not to say'],
  ['male', 'Male'],
  ['female', 'Female'],
  ['other', 'Other'],
]

const ACTIVITY = [
  ['', 'Not set'],
  ['sedentary', 'Sedentary'],
  ['light', 'Lightly active'],
  ['moderate', 'Moderately active'],
  ['active', 'Active'],
  ['very_active', 'Very active'],
]

const selectClass =
  'w-full h-10 rounded-xl border border-emerald-200 px-3 text-sm bg-white'

export function ProfileForm({ profile }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null)

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height_cm">Height (cm)</Label>
          <Input id="height_cm" name="height_cm" type="number" step="0.1"
            defaultValue={profile?.height_cm ?? ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_weight_kg">Target weight (kg)</Label>
          <Input id="target_weight_kg" name="target_weight_kg" type="number" step="0.1"
            defaultValue={profile?.target_weight_kg ?? ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of birth</Label>
          {/* Comes back as "1998-04-12" thanks to the date type parser -
              exactly what a date input wants. */}
          <Input id="date_of_birth" name="date_of_birth" type="date"
  min="1900-01-01"
  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13))
        .toISOString().slice(0, 10)}
  defaultValue={profile?.date_of_birth ?? ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <select id="sex" name="sex" className={selectClass}
            defaultValue={profile?.sex ?? ''}>
            {SEXES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity_level">Activity level</Label>
        <select id="activity_level" name="activity_level" className={selectClass}
          defaultValue={profile?.activity_level ?? ''}>
          {ACTIVITY.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">Saved.</p>
      )}

      <Button type="submit" disabled={isPending}
        className="bg-emerald-600 hover:bg-emerald-700">
        {isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}