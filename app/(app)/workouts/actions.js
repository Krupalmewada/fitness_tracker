'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { createWorkout, deleteWorkout } from '@/lib/services/workout-service'

export async function createWorkoutAction(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated.' }

  const workout_type_id = formData.get('workout_type_id')
  const date = formData.get('date')

  if (!workout_type_id || !date) {
    return { error: 'Type and date are required.' }
  }

  // FormData values are always strings - "" for an untouched number input.
  // Number("") is 0, which would silently store a zero-minute workout.
  const toNumber = (v) => (v === '' || v == null ? null : Number(v))

  try {
    await createWorkout(user.id, {
      workout_type_id,
      duration_minutes: toNumber(formData.get('duration_minutes')),
      calories: toNumber(formData.get('calories')),
      date,
      notes: formData.get('notes') || null,
    })
  } catch (error) {
    if (error.code === '23514') return { error: 'Duration must be greater than zero.' }
    console.error('Create workout error:', error)
    return { error: 'Could not save that workout.' }
  }

  // Tells Next these pages' cached output is stale, so the list re-renders
  // with the new row. Without this the table looks unchanged until a refresh.
  revalidatePath('/workouts')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function deleteWorkoutAction(formData) {
  const user = await getCurrentUser()
  if (!user) return

  await deleteWorkout(user.id, formData.get('id'))

  revalidatePath('/workouts')
  revalidatePath('/dashboard')
}