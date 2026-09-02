'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { updateProfile } from '@/lib/services/profile-service'

const toNumber = (v) => (v === '' || v == null ? null : Number(v))
const toText = (v) => (v === '' || v == null ? null : v)

export async function updateProfileAction(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated.' }

  const date_of_birth = toText(formData.get('date_of_birth'))

  // Validate here so the user gets a readable message. The CHECK constraint
  // in 005 is the actual guarantee - this is just a better error.
  if (date_of_birth) {
    const birth = new Date(date_of_birth)

    if (Number.isNaN(birth.getTime())) {
      return { error: 'That date of birth is not valid.' }
    }

    const thirteenYearsAgo = new Date()
    thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13)

    if (birth > thirteenYearsAgo) {
      return { error: 'You must be at least 13 years old.' }
    }
    if (birth < new Date('1900-01-01')) {
      return { error: 'Please enter a real date of birth.' }
    }
  }

  try {
    await updateProfile(user.id, {
      target_weight_kg: toNumber(formData.get('target_weight_kg')),
      height_cm: toNumber(formData.get('height_cm')),
      sex: toText(formData.get('sex')),
      date_of_birth,
      activity_level: toText(formData.get('activity_level')),
    })
  } catch (error) {
    if (error.code === '23514') {
      return { error: 'Check your date of birth and measurements.' }
    }
    console.error('Update profile error:', error)
    return { error: 'Could not save your profile.' }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}