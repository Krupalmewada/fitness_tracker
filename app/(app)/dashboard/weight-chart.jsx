'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function WeightChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400 py-12 text-center">No weight entries yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <Tooltip />
        <Line type="monotone" dataKey="weight_kg" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}