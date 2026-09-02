import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser } from '@/lib/auth'
import { listWorkouts, listWorkoutTypes } from '@/lib/services/workout-service'
import { NewWorkoutDialog } from './new-workout-dialog'
import { deleteWorkoutAction } from './actions'
import { Trash2, Activity, Dumbbell, Heart, ChevronRight } from 'lucide-react'

// Category drives both the row tint and the icon - that's what makes the
// list read as designed rather than a plain table.
const STYLES = {
  cardio:      { bg: 'bg-powder', ink: 'text-powder-ink', Icon: Activity },
  strength:    { bg: 'bg-blush',  ink: 'text-blush-ink',  Icon: Dumbbell },
  flexibility: { bg: 'bg-sage',   ink: 'text-sage-ink',   Icon: Heart },
  sports:      { bg: 'bg-butter', ink: 'text-butter-ink', Icon: Activity },
  other:       { bg: 'bg-butter', ink: 'text-butter-ink', Icon: Activity },
}

const COLS = 'grid-cols-[1fr_1fr_1fr_1fr_72px]'

export default async function WorkoutsPage() {
  const user = await getCurrentUser()
  const [workouts, types] = await Promise.all([
    listWorkouts(user.id),
    listWorkoutTypes(),
  ])

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Workouts</h1>
          <p className="text-sm text-zinc-500 mt-1">{workouts.length} logged</p>
        </div>
        <NewWorkoutDialog types={types} />
      </div>

      {workouts.length === 0 ? (
        <div className="bg-card border border-hairline rounded-2xl py-20 text-center">
          <div className="w-48 h-48 mx-auto mb-6 relative">
            <Image src="/illustrations/workout-empty.svg" alt="" fill unoptimized
              className="object-contain" />
          </div>
          <p className="text-lg font-medium text-ink">No workouts yet</p>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Log your first activity to start building a picture of your training.
          </p>
          <div className="mt-6 flex justify-center">
            <NewWorkoutDialog
              types={types}
              triggerLabel="+ Log workout"
              triggerClassName="inline-flex items-center justify-center rounded-full bg-ink text-white text-sm font-medium h-11 px-6 hover:bg-zinc-800 transition-colors"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className={`grid ${COLS} gap-4 px-5 pb-1 text-[11px] uppercase tracking-wide text-zinc-400`}>
            <span>Date</span><span>Type</span><span>Duration</span><span>Calories</span><span></span>
          </div>

          {workouts.map((w) => {
            const s = STYLES[w.category] ?? STYLES.other
            return (
              <div key={w.id}
                className={`${s.bg} rounded-2xl grid ${COLS} gap-4 items-center px-5 py-4`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center shrink-0">
                    <s.Icon size={16} className={s.ink} />
                  </div>
                  <span className={`text-sm ${s.ink}`}>{w.date}</span>
                </div>

                <div>
                  <span className={`text-xs ${s.ink} bg-white/60 rounded-full px-3 py-1`}>
                    {w.workout_type}
                  </span>
                </div>

                <span className={`text-sm ${s.ink} opacity-80`}>
                  {w.duration_minutes ? `${w.duration_minutes} min` : '—'}
                </span>

                <span className={`text-sm ${s.ink}`}>
                  <span className="text-lg font-medium">{w.calories ?? '—'}</span>
                  {w.calories_estimated && (
                    <span className="ml-2 text-[10px] uppercase opacity-60">est</span>
                  )}
                </span>

                {/* The row isn't a link: a <form> inside an <a> is invalid HTML,
                    and clicking delete would navigate as well. Separate controls. */}
                <div className="flex items-center gap-2 justify-self-end">
                  <Link href={`/workouts/${w.id}`}
                    aria-label="View workout"
                    className={`${s.ink} opacity-40 hover:opacity-100 transition-opacity`}>
                    <ChevronRight size={18} />
                  </Link>

                  <form action={deleteWorkoutAction}>
                    <input type="hidden" name="id" value={w.id} />
                    <button type="submit" aria-label="Delete workout"
                      className={`${s.ink} opacity-30 hover:opacity-100 transition-opacity`}>
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}