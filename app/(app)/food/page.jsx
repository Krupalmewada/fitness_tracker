import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { listFoodForDate } from '@/lib/services/food-service'
import { NewFoodDialog } from './new-food-dialog'
import { deleteFoodAction } from './actions'
import { Trash2, ChevronLeft, ChevronRight, Sunrise, Sun, Moon, Cookie } from 'lucide-react'

const MEALS = [
  { key: 'breakfast', Icon: Sunrise },
  { key: 'lunch', Icon: Sun },
  { key: 'dinner', Icon: Moon },
  { key: 'snack', Icon: Cookie },
]

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default async function FoodPage({ searchParams }) {
  // searchParams is a Promise in Next 15+, same as params.
  const params = await searchParams
  const date = params?.date ?? new Date().toISOString().slice(0, 10)

  const user = await getCurrentUser()
  const entries = await listFoodForDate(user.id, date)

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories ?? 0),
      protein: acc.protein + (e.protein_g ?? 0),
      carbs: acc.carbs + (e.carbs_g ?? 0),
      fat: acc.fat + (e.fat_g ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Food log</h1>
          <div className="flex items-center gap-2 mt-2">
            <Link href={`/food?date=${shiftDate(date, -1)}`}
              className="w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-zinc-400 hover:text-ink hover:border-zinc-300 transition-colors">
              <ChevronLeft size={15} />
            </Link>
            <span className="text-sm text-zinc-600 min-w-[110px] text-center">{date}</span>
            <Link href={`/food?date=${shiftDate(date, 1)}`}
              className="w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-zinc-400 hover:text-ink hover:border-zinc-300 transition-colors">
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
        <NewFoodDialog date={date} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-butter rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-butter-ink opacity-70">Calories</p>
          <p className="text-3xl font-medium text-butter-ink mt-2">
            {Math.round(totals.calories)}
            <span className="text-xs ml-1 font-normal opacity-70">kcal</span>
          </p>
        </div>
        <div className="bg-blush rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-blush-ink opacity-70">Protein</p>
          <p className="text-3xl font-medium text-blush-ink mt-2">
            {Math.round(totals.protein)}
            <span className="text-xs ml-1 font-normal opacity-70">g</span>
          </p>
        </div>
        <div className="bg-powder rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-powder-ink opacity-70">Carbs</p>
          <p className="text-3xl font-medium text-powder-ink mt-2">
            {Math.round(totals.carbs)}
            <span className="text-xs ml-1 font-normal opacity-70">g</span>
          </p>
        </div>
        <div className="bg-sage rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-sage-ink opacity-70">Fat</p>
          <p className="text-3xl font-medium text-sage-ink mt-2">
            {Math.round(totals.fat)}
            <span className="text-xs ml-1 font-normal opacity-70">g</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MEALS.map(({ key, Icon }) => {
          const items = entries.filter((e) => e.meal_type === key)
          const mealCalories = items.reduce((sum, e) => sum + (e.calories ?? 0), 0)

          return (
            <div key={key} className="bg-card border border-hairline rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-butter flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-butter-ink" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink capitalize">{key}</p>
                  <p className="text-xs text-zinc-400">{Math.round(mealCalories)} kcal</p>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-zinc-300 py-3">Nothing logged.</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((e) => (
                    <li key={e.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{e.food}</p>
                        <p className="text-xs text-zinc-400">
                          {e.quantity ? `${e.quantity}${e.serving_unit ?? ''} · ` : ''}
                          P {e.protein_g ?? 0} · C {e.carbs_g ?? 0} · F {e.fat_g ?? 0}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-ink">{e.calories ?? '—'}</span>
                        <form action={deleteFoodAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <button type="submit" className="text-zinc-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}