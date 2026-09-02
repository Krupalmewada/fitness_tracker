'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { createFood, deleteFood } from '@/lib/services/food-service'

const toNumber = (v) => (v === '' || v == null ? null : Number(v))

export async function createFoodAction(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated.' }

  const food = formData.get('food')
  const meal_type = formData.get('meal_type')
  const date = formData.get('date')

  if (!food || !meal_type || !date) {
    return { error: 'Food, meal and date are required.' }
  }

  try {
    await createFood(user.id, {
      food,
      quantity: toNumber(formData.get('quantity')),
      serving_unit: formData.get('serving_unit') || null,
      meal_type,
      calories: toNumber(formData.get('calories')),
      protein_g: toNumber(formData.get('protein_g')),
      carbs_g: toNumber(formData.get('carbs_g')),
      fat_g: toNumber(formData.get('fat_g')),
      date,
    })
  } catch (error) {
    if (error.code === '23514') return { error: 'Invalid entry. Check the meal type.' }
    console.error('Create food error:', error)
    return { error: 'Could not save that entry.' }
  }

  revalidatePath('/food')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteFoodAction(formData) {
  const user = await getCurrentUser()
  if (!user) return
  await deleteFood(user.id, formData.get('id'))
  revalidatePath('/food')
  revalidatePath('/dashboard')
}