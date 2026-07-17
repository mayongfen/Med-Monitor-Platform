'use client'

import { BedDouble } from 'lucide-react'
import { DEVICES, type DeviceStatus } from '@/lib/monitor-types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { STATUS_META } from './status'
import { cn } from '@/lib/utils'

interface DeviceListProps {
  statuses: Record<string, DeviceStatus>
  heartRates: Record<string, { value: number; valid: boolean } | undefined>
  selectedId: string
  onSelect: (id: string) => void
}

export function DeviceList({ statuses, heartRates, selectedId, onSelect }: DeviceListProps) {
  const counts = DEVICES.reduce(
    (acc, d) => {
      const s = statuses[d.id] ?? 'normal'
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    },
    {} as Record<DeviceStatus, number>,
  )

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">监护设备</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(['critical', 'warning', 'normal', 'offline'] as DeviceStatus[]).map((s) => (
            <span
              key={s}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]',
                STATUS_META[s].bg,
                STATUS_META[s].text,
              )}
            >
              <span className={cn('size-1.5 rounded-full', STATUS_META[s].dot)} />
              {STATUS_META[s].label} {counts[s] ?? 0}
            </span>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {DEVICES.map((d) => {
            const status = statuses[d.id] ?? 'normal'
            const meta = STATUS_META[status]
            const hr = heartRates[d.id]
            const active = d.id === selectedId
            return (
              <button
                key={d.id}
                onClick={() => onSelect(d.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-border hover:bg-accent/40',
                )}
              >
                <div className="relative flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <BedDouble className="size-4 text-muted-foreground" />
                  <span
                    className={cn(
                      'absolute -right-1 -top-1 size-2.5 rounded-full ring-2 ring-card',
                      meta.dot,
                      status === 'critical' && 'animate-pulse',
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {d.bed}床 · {d.name}
                    </p>
                    <span className={cn('text-[11px] font-medium', meta.text)}>{meta.label}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.room} · {status === 'offline' || !hr?.valid ? '-- bpm' : `${Math.round(hr!.value)} bpm`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  )
}
