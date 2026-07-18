'use client'

import Link from 'next/link'
import { Tv, AlertTriangle } from 'lucide-react'
import { useLiveMonitor } from '@/hooks/use-live-monitor'
import { WARDS, BEDS } from '@/lib/ward-data'
import { PATIENTS, ADMISSIONS } from '@/lib/patient-data'
import { cn } from '@/lib/utils'
import { EcgWaveform } from './ecg-waveform'

function maskName(name: string) {
  return name.length <= 1 ? name : name[0] + '某'
}

function getDiag(patientId: string): string {
  return ADMISSIONS.find((x) => x.patientId === patientId)?.diagnosis ?? '—'
}

function maskDiag(d: string): string {
  if (d === '—') return d
  return d.length > 6 ? d.slice(0, 4) + '…' : d
}

export function WaterBoardView() {
  const { vitals, pendingAlarms, history } = useLiveMonitor()

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Tv className="size-4 text-primary" /> 电子水牌
          </h2>
          <span className="text-xs text-muted-foreground">
            实时数据每 2 秒刷新 · 未处理告警 {pendingAlarms.length} 条 · 点击卡片查看详情
          </span>
        </div>

        <div className="space-y-4">
          {WARDS.filter((w) => w.status === 'open').map((w) => {
            const beds = BEDS.filter((b) => b.wardId === w.id)
            const occupied = beds.filter((b) => b.status === 'occupied')
            return (
              <div key={w.id}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{w.name}</h3>
                  <span className="text-xs text-muted-foreground">{w.location} · {w.dept} · 占用 {occupied.length}/{beds.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {occupied.map((b) => {
                    const patient = b.patientId ? PATIENTS.find((p) => p.id === b.patientId) : undefined
                    const bedVitals = vitals[b.id] ?? []
                    const bedAlarms = pendingAlarms.filter((a) => a.bedId === b.id)
                    const hasCritical = bedAlarms.some((a) => a.level === 'critical')
                    const hr = bedVitals.find((v) => v.key === 'heartRate')
                    const rr = bedVitals.find((v) => v.key === 'respiration')
                    const spo2 = bedVitals.find((v) => v.key === 'spo2')
                    const temp = bedVitals.find((v) => v.key === 'temperature')
                    const hist = history[b.id] ?? []

                    return (
                      <Link
                        key={b.id}
                        href="/dashboard"
                        className={cn(
                          'group block rounded-lg border p-3 transition-colors hover:bg-accent/40',
                          hasCritical ? 'border-destructive/50 animate-pulse' : bedAlarms.length > 0 ? 'border-chart-4/50' : 'border-border',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-medium text-foreground">{b.code}床</span>
                          {bedAlarms.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-destructive">
                              <AlertTriangle className="size-3" /> {bedAlarms.length}
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 flex items-center justify-between">
                          <p className="truncate text-sm font-medium text-foreground">
                            {patient ? `${maskName(patient.name)} · ${patient.gender} ${patient.age}岁` : '—'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{maskDiag(getDiag(b.patientId!))}</p>
                        </div>

                        {/* 实时生命体征 */}
                        <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                          <Vital label="HR" value={hr} unit="bpm" cls="text-chart-1" />
                          <Vital label="RR" value={rr} unit="rpm" cls="text-chart-2" />
                          <Vital label="SpO₂" value={spo2} unit="%" cls="text-chart-3" />
                          <Vital label="T" value={temp} unit="°C" cls="text-chart-4" />
                        </div>

                        {/* 心率波形预览 */}
                        {hist.length > 2 && (
                          <div className="mt-2">
                            <EcgWaveform history={hist} color="var(--chart-1)" height={40} className="rounded bg-muted/30" />
                          </div>
                        )}
                      </Link>
                    )
                  })}
                  {occupied.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">该病区当前无在床患者</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          实时生命体征数据来自监护垫，触发告警规则后自动生成告警并联动顶部全局报警条；患者信息脱敏显示。
        </p>
      </div>
    </div>
  )
}

function Vital({ label, value, unit, cls }: { label: string; value?: { value: number; valid: boolean }; unit: string; cls: string }) {
  return (
    <div className="rounded bg-muted/40 py-1">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn('font-mono text-sm font-bold tabular-nums', cls)}>
        {value?.valid ? value.value.toFixed(0) : '--'}
      </p>
      <p className="text-[9px] text-muted-foreground">{unit}</p>
    </div>
  )
}
