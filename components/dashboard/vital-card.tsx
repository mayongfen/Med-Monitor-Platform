'use client'

import { Droplets, HeartPulse, Thermometer, Unplug, Wind } from 'lucide-react'
import type { DeviceStatus, VitalConfig, VitalReading } from '@/lib/monitor-types'
import { STATUS_META } from './status'
import { cn } from '@/lib/utils'

const ICONS = {
  heartRate: HeartPulse,
  respiration: Wind,
  spo2: Droplets,
  temperature: Thermometer,
} as const

function Sparkline({ points, color, invalid }: { points: number[]; color: string; invalid: boolean }) {
  if (invalid || points.length < 2) {
    return <div className="h-10 w-full rounded bg-muted/60" aria-hidden />
  }
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const w = 100
  const h = 40
  const step = w / (points.length - 1)
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(2)} ${(h - ((p - min) / range) * (h - 6) - 3).toFixed(2)}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface VitalCardProps {
  config: VitalConfig
  reading: VitalReading
  history: number[]
  status: DeviceStatus
}

export function VitalCard({ config, reading, history, status }: VitalCardProps) {
  const Icon = ICONS[config.key]
  const invalid = !reading.valid
  const meta = STATUS_META[invalid ? 'offline' : status]

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-card p-4 transition-colors',
        invalid ? 'border-border' : meta.border,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-lg',
              invalid ? 'bg-muted' : meta.bg,
            )}
          >
            <Icon className={cn('size-4', invalid ? 'text-muted-foreground' : meta.text)} />
          </div>
          <span className={cn('text-sm font-medium', invalid ? 'text-muted-foreground' : 'text-foreground')}>
            {config.label}
          </span>
        </div>
        {!invalid && (
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]', meta.bg, meta.text)}>
            <span className={cn('size-1.5 rounded-full', meta.dot)} />
            {meta.label}
          </span>
        )}
      </div>

      {invalid ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-1.5 py-2 text-center">
          <Unplug className="size-6 text-muted-foreground" />
          <span className="font-mono text-2xl font-semibold text-muted-foreground/70">--</span>
          <span className="text-xs text-muted-foreground">传感器未佩戴</span>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className={cn('font-mono text-4xl font-bold tabular-nums', meta.text)}>
              {reading.value.toFixed(config.decimals)}
            </span>
            <span className="text-sm text-muted-foreground">{config.unit}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            正常 {config.normal[0]} - {config.normal[1]} {config.unit}
          </p>
          <div className="mt-2">
            <Sparkline points={history} color={config.chart} invalid={invalid} />
          </div>
        </>
      )}
    </div>
  )
}
