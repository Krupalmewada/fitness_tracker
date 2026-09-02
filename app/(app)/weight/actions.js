'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { createWeight, deleteWeight } from '@/lib/services/weight-service'

const toNumber = (v) => (v === '' || v == null ? null : Number(v))

export async function createWeightAction(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated.' }

  const weight_kg = toNumber(formData.get('weight_kg'))
  const date = formData.get('date')

  if (!weight_kg || !date) return { error: 'Weight and date are required.' }

  try {
    await createWeight(user.id, {
      weight_kg,
      body_fat_percent: toNumber(formData.get('body_fat_percent')),
      date,
      notes: formData.get('notes') || null,
    })
  } catch (error) {
    // The constraint you named yourself, surfacing as a real message.
    if (error.code === '23505') {
      return { error: 'You already logged a weight for that date.' }
    }
    if (error.code === '23514') return { error: 'That weight looks out of range.' }
    console.error('Create weight error:', error)
    return { error: 'Could not save that entry.' }
  }

  revalidatePath('/weight')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteWeightAction(formData) {
  const user = await getCurrentUser()
  if (!user) return
  await deleteWeight(user.id, formData.get('id'))
  revalidatePath('/weight')
  revalidatePath('/dashboard')
}