import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getWorkoutWithSets, listExercises } from '@/lib/services/workout-service'
import { AddSetDialog } from './add-set-dialog'
import { deleteSetAction } from './actions'
import { ChevronLeft, Trash2, Dumbbell } from 'lucide-react'

// One set row reads differently depending on what the exercise tracks.
function describeSet(set) {
  if (set.reps != null) {
    return set.weight_kg != null
      ? `${set.reps} reps · ${set.weight_kg} kg`
      : `${set.reps} reps`
  }
  if (set.duration_seconds != null) return `${set.duration_seconds} sec`
  if (set.distance_m != null) return `${set.distance_m} m`
  return '—'
}

export default async function WorkoutDetailPage({ params }) {
  // params is a Promise in Next 15+.
  const { id } = await params

  const user = await getCurrentUser()
  const [workout, exercises] = await Promise.all([
    getWorkoutWithSets(user.id, id),
    listExercises(),
  ])

  // Covers both "doesn't exist" and "isn't yours" - deliberately the same
  // response, so you can't probe for which workout ids are real.
  if (!workout) notFound()

  // Group by exercise so the page reads like a training log rather than
  // a flat list of rows.
  const byExercise = workout.sets.reduce((acc, set) => {
    acc[set.exercise_id] ??= { exercise: set.exercise, muscle_group: set.muscle_group, sets: [] }
    acc[set.exercise_id].sets.push(set)
    return acc
  }, {})

  const groups = Object.entries(byExercise)
  const totalVolume = workout.sets.reduce(
    (sum, s) => sum + (s.reps ?? 0) * (s.weight_kg ?? 0),
    0
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/workouts"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-ink transition-colors">
        <ChevronLeft size={16} />
        Workouts
      </Link>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">{workout.workout_type}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {workout.date}
            {workout.duration_minutes ? ` · ${workout.duration_minutes} min` : ''}
            {workout.calories ? ` · ${workout.calories} kcal` : ''}
            {workout.calories_estimated && ' (est)'}
          </p>
        </div>
        <AddSetDialog workoutId={workout.id} exercises={exercises} existingSets={workout.sets} />
      </div>

      {workout.notes && (
        <div className="bg-card border border-hairline rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">Notes</p>
          <p className="text-sm text-zinc-600">{workout.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blush rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-blush-ink opacity-70">Exercises</p>
          <p className="text-3xl font-medium text-blush-ink mt-2">{groups.length}</p>
        </div>
        <div className="bg-powder rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-powder-ink opacity-70">Total sets</p>
          <p className="text-3xl font-medium text-powder-ink mt-2">{workout.sets.length}</p>
        </div>
        <div className="bg-sage rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-sage-ink opacity-70">Volume</p>
          <p className="text-3xl font-medium text-sage-ink mt-2">
            {Math.round(totalVolume)}
            <span className="text-xs ml-1 font-normal opacity-70">kg</span>
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-card border border-hairline rounded-2xl py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-butter mx-auto flex items-center justify-center mb-4">
            <Dumbbell size={22} className="text-butter-ink" />
          </div>
          <p className="text-base font-medium text-ink">No sets logged</p>
          <p className="text-sm text-zinc-500 mt-1">
            Add the exercises you did in this session.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([exerciseId, group]) => (
            <div key={exerciseId} className="bg-card border border-hairline rounded-2xl p-5">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-sm font-medium text-ink">{group.exercise}</p>
                <p className="text-xs text-zinc-400 capitalize">{group.muscle_group}</p>
              </div>

              <ul className="space-y-1">
                {group.sets.map((set) => (
                  <li key={set.id}
                    className="flex items-center gap-4 py-2 border-t border-hairline first:border-t-0">
                    <span className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs text-zinc-500 shrink-0">
                      {set.set_number}
                    </span>
                    <span className="flex-1 text-sm text-ink">{describeSet(set)}</span>
                    <form action={deleteSetAction}>
                      <input type="hidden" name="workout_id" value={workout.id} />
                      <input type="hidden" name="set_id" value={set.id} />
                      <button type="submit" className="text-zinc-300 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}