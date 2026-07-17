'use client'

import { useState } from 'react'
import { Activity, BedDouble, BellRing, Stethoscope, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { USERS } from '@/lib/admin-data'
import { BEDS, bedStatusCount, BED_STATUS_LABEL, BED_STATUS_META, type BedStatus } from '@/lib/ward-data'
import { activeAdmissions } from '@/lib/patient-data'
import { ALARM_RECORDS, alarmStats, ALARM_TYPE_LABEL, ALARM_LEVEL_META, ALARM_STATUS_META } from '@/lib/alarm-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function HomeView() {
  const [range, setRange] = useState<'week' | 'month'>('week')
  const stats = alarmStats()
  const pendingAlarms = ALARM_RECORDS.filter((a) => a.status === 'pending').slice(0, 5)
  const bedCounts = bedStatusCount()
  const leaveCount = ALARM_RECORDS.filter((a) => a.type === 'leave' && a.status === 'pending').length
  const inBedCount = bedCounts.occupied ?? 0

  const rangeData = range === 'week'
    ? stats.byWeek
    : [{ day: '第1周', count: 9 }, { day: '第2周', count: 6 }, { day: '第3周', count: 8 }, { day: '第4周', count: 7 }]
  const maxRange = Math.max(...rangeData.map((d) => d.count), 1)

  return (
    <div className="space-y-4">
      {/* 顶部三个统计卡 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Stethoscope}
          label="医护人员"
          value={USERS.length}
          unit="人"
          accent="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={Activity}
          label="在院患者"
          value={activeAdmissions().length}
          unit="人"
          accent="text-chart-1"
          bg="bg-chart-1/10"
        />
        <StatCard
          icon={BedDouble}
          label="床位使用"
          value={`${inBedCount}/${BEDS.length}`}
          unit={`在床 ${inBedCount} · 离床 ${leaveCount}`}
          accent="text-chart-5"
          bg="bg-chart-5/10"
        />
      </div>

      {/* 床位状态分布条 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">床位状态分布</h2>
          <span className="text-xs text-muted-foreground">共 {BEDS.length} 张</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          {(Object.keys(bedCounts) as BedStatus[]).map((s) => {
            const c = bedCounts[s] ?? 0
            if (!c) return null
            return (
              <div
                key={s}
                className={cn(BED_STATUS_META[s].dot)}
                style={{ width: `${(c / BEDS.length) * 100}%` }}
                title={`${BED_STATUS_LABEL[s]} ${c}`}
              />
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {(Object.keys(BED_STATUS_LABEL) as BedStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn('size-2 rounded-full', BED_STATUS_META[s].dot)} />
              {BED_STATUS_LABEL[s]} {bedCounts[s] ?? 0}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 报警消息 */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BellRing className="size-4 text-destructive" /> 报警消息
            </h2>
            <Badge variant="secondary" className="text-[10px]">{pendingAlarms.length} 条未处理</Badge>
          </div>
          <div className="flex flex-col">
            {pendingAlarms.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">暂无未处理报警</p>
            ) : (
              pendingAlarms.map((a) => {
                const meta = ALARM_LEVEL_META[a.level]
                return (
                  <div key={a.id} className="flex items-start gap-3 border-b border-border/50 py-2.5 last:border-0">
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', meta.dot, a.level === 'critical' && 'animate-pulse')} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">
                        <span className="font-medium">{ALARM_TYPE_LABEL[a.type]}</span> · {a.message}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">{a.raisedAt}</p>
                    </div>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px]', meta.cls)}>{meta.label}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 报警统计 */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">报警处理统计</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground">{stats.total}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">报警总数</p>
            </div>
            <div className="rounded-lg bg-chart-5/10 p-3 text-center">
              <p className="text-2xl font-bold tabular-nums text-chart-5">{stats.handled}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">已处理</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-center">
              <p className="text-2xl font-bold tabular-nums text-destructive">{stats.pending}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">未处理</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" />
            处理率 {stats.total ? Math.round((stats.handled / stats.total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* 报警分类统计 + 趋势 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">报警分类统计</h2>
          <div className="space-y-2.5">
            {stats.byType.map((t) => {
              const max = Math.max(...stats.byType.map((x) => x.count), 1)
              return (
                <div key={t.type} className="flex items-center gap-3">
                  <span className="w-10 text-xs text-muted-foreground">{t.label}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="flex h-full items-center justify-end rounded bg-primary/70 px-2 text-[10px] font-medium text-white"
                      style={{ width: `${(t.count / max) * 100}%` }}
                    >
                      {t.count}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">报警趋势</h2>
            <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
              {(['week', 'month'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    'rounded-md px-2.5 py-1 transition-colors',
                    range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                >
                  {r === 'week' ? '按周' : '按月'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-32 items-end justify-between gap-2">
            {rangeData.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-chart-4/70 transition-all"
                    style={{ height: `${(d.count / maxRange) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
                <span className="text-[10px] font-medium text-foreground">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  accent,
  bg,
}: {
  icon: typeof Activity
  label: string
  value: number | string
  unit: string
  accent: string
  bg: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className={cn('flex size-12 items-center justify-center rounded-lg', bg)}>
        <Icon className={cn('size-6', accent)} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </p>
      </div>
    </div>
  )
}
