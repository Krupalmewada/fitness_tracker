import Link from 'next/link'

const OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

// No 'use client' - the selected period lives in the URL, so these are
// just links. Back button works, the page is shareable, no state to sync.
export function PeriodToggle({ current }) {
  return (
    <div className="inline-flex gap-1 bg-card border border-hairline rounded-full p-1">
      {OPTIONS.map(({ value, label }) => (
        <Link key={value} href={`/dashboard?period=${value}`}
          className={`px-4 py-1.5 rounded-full text-xs transition-colors ${
            current === value ? 'bg-ink text-white' : 'text-zinc-500 hover:text-ink'
          }`}>
          {label}
        </Link>
      ))}
    </div>
  )
}