import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getDashboardData, isValidPeriod } from '@/lib/services/dashboard-service'
import { WeightChart } from './weight-chart'
import { PeriodToggle } from './period-toggle'
import { Flame, Apple, ArrowLeftRight, Activity, Dumbbell, Heart, Plus } from 'lucide-react'

const UNITS = { today: 'today', week: 'this wk', month: 'this mo' }

const CATEGORY = {
  cardio:      { bg: 'bg-powder', ink: 'text-powder-ink', Icon: Activity },
  strength:    { bg: 'bg-blush',  ink: 'text-blush-ink',  Icon: Dumbbell },
  flexibility: { bg: 'bg-sage',   ink: 'text-sage-ink',   Icon: Heart },
  sports:      { bg: 'bg-butter', ink: 'text-butter-ink', Icon: Activity },
  other:       { bg: 'bg-butter', ink: 'text-butter-ink', Icon: Activity },
}

const QUICK = [
  { href: '/food', label: 'Log a meal' },
  { href: '/workouts', label: 'Plan workout' },
]

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams
  // Fall back rather than trusting the URL - ?period=<anything> shouldn't 500.
  const period = isValidPeriod(params?.period) ? params.period : 'today'

  const user = await getCurrentUser()
  const data = await getDashboardData(user.id, period)

  const cards = [
    { key: 'burned',   label: 'Burned',   unit: 'kcal',        bg: 'bg-butter', ink: 'text-butter-ink', Icon: Flame },
    { key: 'eaten',    label: 'Eaten',    unit: 'kcal',        bg: 'bg-blush',  ink: 'text-blush-ink',  Icon: Apple },
    { key: 'net',      label: 'Net',      unit: 'kcal',        bg: 'bg-sage',   ink: 'text-sage-ink',   Icon: ArrowLeftRight },
    { key: 'sessions', label: 'Sessions', unit: UNITS[period], bg: 'bg-powder', ink: 'text-powder-ink', Icon: Activity },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Good day, {user.username}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {period === 'today' ? "Here's your day so far." : `Here's your ${period}.`}
          </p>
        </div>
        <PeriodToggle current={period} />
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-5">
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {cards.map(({ key, label, unit, bg, ink, Icon }) => (
              <div key={key} className={`${bg} rounded-2xl p-4`}>
                <div className="flex items-start justify-between">
                  <p className={`text-[11px] uppercase tracking-wide ${ink} opacity-70`}>{label}</p>
                  <Icon size={16} className={`${ink} opacity-60`} />
                </div>
                <p className={`text-3xl font-medium ${ink} mt-2`}>
                  {data[key]}
                  <span className="text-[11px] ml-1.5 font-normal opacity-70">{unit}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {QUICK.map(({ href, label }) => (
              <Link key={href} href={href}
                className="flex items-center justify-center gap-2 bg-card border border-hairline rounded-2xl py-4 text-sm text-zinc-600 hover:border-zinc-300 transition-colors">
                <Plus size={16} />
                {label}
              </Link>
            ))}
          </div>

          <div className="bg-card border border-hairline rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-ink">Latest activity</p>
              <Link href="/workouts" className="text-xs text-zinc-400 hover:text-ink uppercase tracking-wide">
                View all
              </Link>
            </div>

            {data.workouts.length === 0 ? (
              <p className="text-sm text-zinc-400 py-8 text-center">
                No workouts yet. Log your first one to get started.
              </p>
            ) : (
              <ul className="space-y-1">
                {data.workouts.map((w) => {
                  const c = CATEGORY[w.category] ?? CATEGORY.other
                  return (
                    <li key={w.id} className="flex items-center gap-3 py-2.5">
                      <div className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center shrink-0`}>
                        <c.Icon size={16} className={c.ink} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink">{w.workout_type}</p>
                        <p className="text-xs text-zinc-400">
                          {w.date} · {w.duration_minutes ?? '—'} min
                        </p>
                      </div>
                      <p className="text-sm text-ink shrink-0">{w.calories ?? '—'} kcal</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-hairline rounded-2xl p-5">
            <p className="text-sm font-medium text-ink mb-1">Current weight</p>
            <p className="text-4xl font-medium text-ink">
              {data.weight ?? '—'}
              <span className="text-base font-normal text-zinc-400 ml-1">kg</span>
            </p>
          </div>

          <div className="bg-card border border-hairline rounded-2xl p-5">
            <p className="text-sm font-medium text-ink mb-3">Weight trend</p>
            <WeightChart data={[...data.weights]} />
          </div>
        </div>
      </div>
    </div>
  )
}