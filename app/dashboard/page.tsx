'use client'

import { useMemo, useState } from 'react'
import { DEVICES, VITAL_CONFIGS, type DeviceStatus } from '@/lib/monitor-types'
import { useMonitorData } from '@/hooks/use-monitor-data'
import { TopNav } from '@/components/dashboard/top-nav'
import { DeviceList } from '@/components/dashboard/device-list'
import { VitalCard } from '@/components/dashboard/vital-card'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { STATUS_META } from '@/components/dashboard/status'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { snapshot, alarms } = useMonitorData()
  const [selectedId, setSelectedId] = useState(DEVICES[0].id)

  const statuses = useMemo(() => {
    const map: Record<string, DeviceStatus> = {}
    for (const d of DEVICES) map[d.id] = snapshot[d.id]?.status ?? 'normal'
    return map
  }, [snapshot])

  const heartRates = useMemo(() => {
    const map: Record<string, { value: number; valid: boolean } | undefined> = {}
    for (const d of DEVICES) map[d.id] = snapshot[d.id]?.vitals.heartRate
    return map
  }, [snapshot])

  const device = DEVICES.find((d) => d.id === selectedId)!
  const runtime = snapshot[selectedId]
  const status = runtime?.status ?? 'normal'
  const meta = STATUS_META[status]

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav alarms={alarms} />

      <div className="flex min-h-0 flex-1">
        <DeviceList
          statuses={statuses}
          heartRates={heartRates}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {/* 中间：病人信息 + 四张生命体征卡片 */}
        <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                {device.bed}
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {device.name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {device.gender} · {device.age}岁
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {device.room} · {device.bed}床 · 设备 {device.deviceModel} · {device.id}
                </p>
              </div>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium',
                meta.bg,
                meta.text,
                meta.border,
              )}
            >
              <span className={cn('size-2 rounded-full', meta.dot, status === 'critical' && 'animate-pulse')} />
              {meta.label}
            </span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {VITAL_CONFIGS.map((c) => {
              const reading = runtime?.vitals[c.key] ?? { value: 0, valid: false }
              const history = (runtime?.history ?? [])
                .map((p) => p[c.key])
                .filter((v): v is number => v != null)
              return (
                <VitalCard key={c.key} config={c} reading={reading} history={history} status={status} />
              )
            })}
          </div>
        </main>

        {/* 右侧：实时趋势图 */}
        <div className="hidden w-[38%] max-w-xl shrink-0 border-l border-border p-4 lg:block">
          <TrendChart data={runtime?.history ?? []} patientLabel={`${device.bed}床 ${device.name}`} />
        </div>
      </div>
    </div>
  )
}
