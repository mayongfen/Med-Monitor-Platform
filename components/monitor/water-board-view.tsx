'use client'

import Link from 'next/link'
import { Tv, AlertTriangle } from 'lucide-react'
import { WARDS, BEDS, BED_STATUS_META, BED_STATUS_LABEL } from '@/lib/ward-data'
import { PATIENTS, ADMISSIONS } from '@/lib/patient-data'
import { ALARM_RECORDS, ALARM_LEVEL_META, ALARM_TYPE_LABEL } from '@/lib/alarm-data'
import { DEVICES_LIFECYCLE } from '@/lib/device-data'
import { cn } from '@/lib/utils'

function maskName(name: string) {
  return name.length <= 1 ? name : name[0] + '某'
}

export function WaterBoardView() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Tv className="size-4 text-primary" /> 电子水牌
          </h2>
          <span className="text-xs text-muted-foreground">病区实时监护总览 · 点击卡片查看详情</span>
        </div>

        <div className="space-y-4">
          {WARDS.filter((w) => w.status === 'open').map((w) => {
            const beds = BEDS.filter((b) => b.wardId === w.id)
            return (
              <div key={w.id}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{w.name}</h3>
                  <span className="text-xs text-muted-foreground">{w.location} · {w.dept}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {beds.map((b) => {
                    const patient = b.patientId ? PATIENTS.find((p) => p.id === b.patientId) : undefined
                    const dev = b.deviceId ? DEVICES_LIFECYCLE.find((d) => d.id === b.deviceId) : undefined
                    const bedAlarms = ALARM_RECORDS.filter(
                      (a) => a.bedId === b.id && a.status === 'pending',
                    )
                    const hasCritical = bedAlarms.some((a) => a.level === 'critical')
                    const devOk = !dev || dev.status !== 'fault'
                    const borderCls = hasCritical
                      ? 'border-destructive/50'
                      : bedAlarms.length > 0
                        ? 'border-chart-4/50'
                        : 'border-border'

                    return (
                      <Link
                        key={b.id}
                        href="/dashboard"
                        className={cn(
                          'group block rounded-lg border p-3 transition-colors hover:bg-accent/40',
                          borderCls,
                          hasCritical && 'animate-pulse',
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

                        {patient ? (
                          <div className="mt-2">
                            <p className="truncate text-sm font-medium text-foreground">
                              {maskName(patient.name)} · {patient.gender} · {patient.age}岁
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">诊断：{maskDiag(getDiag(b.patientId!))}</p>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">—</p>
                        )}

                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1">
                            <span
                              className={cn(
                                'size-1.5 rounded-full',
                                dev ? (devOk ? 'bg-chart-5' : 'bg-destructive') : 'bg-muted-foreground',
                              )}
                            />
                            <span className="text-muted-foreground">{dev ? (devOk ? '正常' : '故障') : '未绑'}</span>
                          </span>
                          {bedAlarms.length > 0 && (
                            <span className={cn('rounded px-1 py-0.5', ALARM_LEVEL_META[bedAlarms[0].level].cls)}>
                              {ALARM_TYPE_LABEL[bedAlarms[0].type]}
                            </span>
                          )}
                          {bedAlarms.length === 0 && b.status !== 'occupied' && (
                            <span className={cn('rounded px-1 py-0.5', BED_STATUS_META[b.status].cls)}>
                              {BED_STATUS_LABEL[b.status]}
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          显示内容：患者基本信息（脱敏）/ 设备状态（颜色区分）/ 未处理告警闪烁；点击跳转实时监护详情。
        </p>
      </div>
    </div>
  )
}

function getDiag(patientId: string): string {
  return ADMISSIONS.find((x) => x.patientId === patientId)?.diagnosis ?? '—'
}

function maskDiag(d: string): string {
  if (d === '—') return d
  return d.length > 6 ? d.slice(0, 4) + '…' : d
}
