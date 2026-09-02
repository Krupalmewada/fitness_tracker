import Image from 'next/image'
import { getCurrentUser } from '@/lib/auth'
import { listWeights } from '@/lib/services/weight-service'
import { WeightChart } from '../dashboard/weight-chart'
import { NewWeightDialog } from './new-weight-dialog'
import { deleteWeightAction } from './actions'
import { Trash2, Lightbulb } from 'lucide-react'
<Image src="/illustrations/weighing-scale.svg" alt="" fill priority className="object-contain" />

const TIPS = [
  'Weigh yourself at the same time each day, ideally in the morning.',
  'Consistency matters more than the number on the scale.',
  'Focus on long-term trends rather than daily fluctuations.',
]

export default async function WeightPage() {
  const user = await getCurrentUser()
  const entries = await listWeights(user.id)

  const isEmpty = entries.length === 0
  const latest = entries[0]
  const oldest = entries[entries.length - 1]
  const change = latest && oldest ? (latest.weight_kg - oldest.weight_kg).toFixed(1) : null

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">
            {isEmpty ? 'Welcome to your journey' : 'Weight tracker'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isEmpty
              ? 'Track your progress and build healthy habits over time.'
              : 'Monitor your progress over time.'}
          </p>
        </div>
        <NewWeightDialog />
      </div>

      {/* Cards stay visible when empty - a layout that keeps its shape
          between states feels more solid than one that appears from nothing. */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-butter rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-butter-ink opacity-70">
            Current weight
          </p>
          <p className="text-4xl font-medium text-butter-ink mt-2">
            {latest?.weight_kg ?? '0.0'}
            <span className="text-base ml-1 font-normal opacity-70">kg</span>
          </p>
          {isEmpty && (
            <p className="text-xs text-butter-ink opacity-60 mt-1">No data logged yet</p>
          )}
        </div>

        <div className="bg-blush rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-blush-ink opacity-70">
            Starting weight
          </p>
          <p className="text-4xl font-medium text-blush-ink mt-2">
            {oldest?.weight_kg ?? '—'}
            {oldest && <span className="text-base ml-1 font-normal opacity-70">kg</span>}
          </p>
          {isEmpty && (
            <p className="text-xs text-blush-ink opacity-60 mt-1">Awaiting first entry</p>
          )}
        </div>

        <div className="bg-sage rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wide text-sage-ink opacity-70">
            Total change
          </p>
          <p className="text-4xl font-medium text-sage-ink mt-2">
            {change ? `${change > 0 ? '+' : ''}${change}` : '0.0'}
            <span className="text-base ml-1 font-normal opacity-70">kg</span>
          </p>
          {isEmpty && (
            <p className="text-xs text-sage-ink opacity-60 mt-1">Ready to track</p>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-card border border-hairline rounded-2xl p-8">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 items-center">
            <div className="text-center">
              <div className="w-44 h-44 mx-auto mb-6 relative">
                {/* Decorative - the heading below already carries the meaning. */}
                <Image src="/illustrations/weighing-scale.svg" alt="" fill
                  className="object-contain" />
              </div>

              <p className="text-xl font-medium text-ink">Track your first weight</p>
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                Start by logging your current weight. We&apos;ll visualise your progress
                over time with easy-to-read charts and insights.
              </p>

              <div className="mt-6 flex justify-center">
                <NewWeightDialog
                  triggerLabel="+ Log first entry"
                  triggerClassName="inline-flex items-center justify-center rounded-full bg-ink text-white text-sm font-medium h-11 px-6 hover:bg-zinc-800 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-butter/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={15} className="text-butter-ink" />
                  <p className="text-sm font-medium text-ink">Tips for tracking</p>
                </div>
                <ul className="space-y-2">
                  {TIPS.map((tip) => (
                    <li key={tip} className="text-xs text-zinc-500 leading-relaxed flex gap-2">
                      <span className="text-zinc-300">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-powder/40 rounded-2xl p-5">
                <p className="text-sm font-medium text-ink mb-2">Why track weight?</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Monitoring your weight helps identify patterns in your health and
                  keeps you accountable to your goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-card border border-hairline rounded-2xl p-5">
            <p className="text-sm font-medium text-ink mb-4">Weight trend</p>
            {/* The list is newest-first; a chart reads oldest-first. */}
            <WeightChart data={[...entries].reverse()} />
          </div>

          <div className="bg-card border border-hairline rounded-2xl p-5">
            <p className="text-sm font-medium text-ink mb-4">History</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-zinc-400">
                  <th className="text-left font-normal pb-3">Date</th>
                  <th className="text-left font-normal pb-3">Weight</th>
                  <th className="text-left font-normal pb-3">Body fat</th>
                  <th className="text-left font-normal pb-3">Notes</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-hairline">
                    <td className="py-3 text-zinc-600">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-ink mr-2 align-middle" />
                      {e.date}
                    </td>
                    <td className="py-3 text-ink">{e.weight_kg} kg</td>
                    <td className="py-3 text-zinc-400">
                      {e.body_fat_percent ? `${e.body_fat_percent}%` : '—'}
                    </td>
                    <td className="py-3 text-zinc-400 italic">{e.notes ?? '—'}</td>
                    <td className="py-3 text-right">
                      <form action={deleteWeightAction}>
                        <input type="hidden" name="id" value={e.id} />
                        <button type="submit" className="text-zinc-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}