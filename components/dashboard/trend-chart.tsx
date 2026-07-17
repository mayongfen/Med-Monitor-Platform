'use client'

import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { VITAL_CONFIGS, type TrendPoint, type VitalKey } from '@/lib/monitor-types'
import { cn } from '@/lib/utils'

export function TrendChart({ data, patientLabel }: { data: TrendPoint[]; patientLabel: string }) {
  const [active, setActive] = useState<Record<VitalKey, boolean>>({
    heartRate: true,
    respiration: true,
    spo2: true,
    temperature: false,
  })

  return (
    <section className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">实时趋势</h2>
          <p className="text-xs text-muted-foreground">{patientLabel} · 近 {data.length} 次采样</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {VITAL_CONFIGS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive((p) => ({ ...p, [c.key]: !p[c.key] }))}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
              active[c.key] ? 'border-border bg-secondary text-foreground' : 'border-border text-muted-foreground opacity-60',
            )}
          >
            <span className="size-2 rounded-full" style={{ background: c.chart }} />
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--popover-foreground)',
              }}
              labelStyle={{ color: 'var(--muted-foreground)' }}
            />
            {VITAL_CONFIGS.filter((c) => active[c.key]).map((c) => (
              <Line
                key={c.key}
                type="monotone"
                dataKey={c.key}
                name={c.label}
                stroke={c.chart}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
