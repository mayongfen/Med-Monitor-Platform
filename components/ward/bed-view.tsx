'use client'

import { useState } from 'react'
import { Plus, BedDouble } from 'lucide-react'
import {
  WARDS,
  BEDS,
  BED_STATUS_LABEL,
  BED_STATUS_META,
  BED_TYPE_LABEL,
  type BedStatus,
} from '@/lib/ward-data'
import { patientName } from '@/lib/patient-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STATUS_ORDER: BedStatus[] = ['occupied', 'idle', 'reserved', 'disinfect', 'maintenance']

export function BedView() {
  const [wardId, setWardId] = useState<string>('all')

  const beds = wardId === 'all' ? BEDS : BEDS.filter((b) => b.wardId === wardId)
  const grouped = WARDS.map((w) => ({
    ward: w,
    beds: BEDS.filter((b) => b.wardId === w.id),
  })).filter((g) => wardId === 'all' || g.ward.id === wardId)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BedDouble className="size-4 text-primary" /> 床位看板
          </h2>
          <div className="flex items-center gap-2">
            <div className="inline-flex flex-wrap gap-1.5">
              <button
                onClick={() => setWardId('all')}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs transition-colors',
                  wardId === 'all' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground',
                )}
              >
                全部
              </button>
              {WARDS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWardId(w.id)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs transition-colors',
                    wardId === w.id ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground',
                  )}
                >
                  {w.name}
                </button>
              ))}
            </div>
            <Button size="sm">
              <Plus className="size-4" /> 新增床位
            </Button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-3">
          {STATUS_ORDER.map((s) => {
            const c = beds.filter((b) => b.status === s).length
            return (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn('size-2 rounded-full', BED_STATUS_META[s].dot)} />
                {BED_STATUS_LABEL[s]} {c}
              </span>
            )
          })}
        </div>

        <div className="space-y-4">
          {grouped.map(({ ward, beds: wbeds }) => (
            <div key={ward.id}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">{ward.name}</h3>
                <span className="text-xs text-muted-foreground">{ward.location} · {ward.dept}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {wbeds.map((b) => {
                  const meta = BED_STATUS_META[b.status]
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        'rounded-lg border p-2.5 transition-colors',
                        b.status === 'maintenance' ? 'border-destructive/40' : 'border-border',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-medium text-foreground">{b.code}</span>
                        <span className={cn('size-2 rounded-full', meta.dot, b.status === 'maintenance' && 'animate-pulse')} />
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {BED_TYPE_LABEL[b.type]}
                      </p>
                      <div className="mt-1.5">
                        <span className={cn('inline-flex rounded px-1.5 py-0.5 text-[10px]', meta.cls)}>
                          {BED_STATUS_LABEL[b.status]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-foreground">
                        {b.patientId ? patientName(b.patientId) : '—'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          绑定规则：同一时间一张病床仅能绑定一台设备，仅"库存备用"设备可绑定；出院自动解绑并标记床位为"待消毒"。
        </p>
      </div>
    </div>
  )
}
