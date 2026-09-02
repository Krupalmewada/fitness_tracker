'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { addSet, deleteSet } from '@/lib/services/workout-service'

const toNumber = (v) => (v === '' || v == null ? null : Number(v))

export async function addSetAction(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated.' }

  const workoutId = formData.get('workout_id')
  const exercise_id = formData.get('exercise_id')
  const set_number = toNumber(formData.get('set_number'))

  if (!exercise_id || !set_number) {
    return { error: 'Pick an exercise and a set number.' }
  }

  const reps = toNumber(formData.get('reps'))
  const duration_seconds = toNumber(formData.get('duration_seconds'))
  const distance_m = toNumber(formData.get('distance_m'))

  // Mirrors the CHECK constraint, so the user gets a clear message rather
  // than a generic violation. The constraint stays as the real guarantee.
  if (reps === null && duration_seconds === null && distance_m === null) {
    return { error: 'A set needs reps, duration, or distance.' }
  }

  try {
    const created = await addSet(user.id, workoutId, {
      exercise_id,
      set_number,
      reps,
      weight_kg: toNumber(formData.get('weight_kg')),
      duration_seconds,
      distance_m,
    })

    // null means the WHERE EXISTS failed - wrong owner, or no such workout.
    if (!created) return { error: 'Workout not found.' }
  } catch (error) {
    if (error.code === '23505') {
      return { error: 'That set number already exists for this exercise.' }
    }
    if (error.code === '23514') return { error: 'Check the values you entered.' }
    console.error('Add set error:', error)
    return { error: 'Could not save that set.' }
  }

  revalidatePath(`/workouts/${workoutId}`)
  return { success: true }
}

export async function deleteSetAction(formData) {
  const user = await getCurrentUser()
  if (!user) return

  const workoutId = formData.get('workout_id')
  await deleteSet(user.id, workoutId, formData.get('set_id'))

  revalidatePath(`/workouts/${workoutId}`)
}