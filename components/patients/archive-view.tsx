'use client'

import { useState } from 'react'
import { Archive, Search, Download } from 'lucide-react'
import { useStore } from '@/lib/store'
import { patientName, OUTCOME_LABEL, stayDays, type Outcome } from '@/lib/patient-data'
import { wardName } from '@/lib/ward-data'
import { exportCSV } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function ArchiveView() {
  const { admissions } = useStore()
  const [q, setQ] = useState('')
  const [outcome, setOutcome] = useState<Outcome | 'all'>('all')

  const all = admissions.filter((a) => a.status === 'discharged')
  const list = all.filter((a) => {
    if (q) {
      const kw = q.trim().toLowerCase()
      if (!patientName(a.patientId).toLowerCase().includes(kw) && !a.admissionNo.toLowerCase().includes(kw) && !a.diagnosis.toLowerCase().includes(kw)) return false
    }
    if (outcome !== 'all' && a.outcome !== outcome) return false
    return true
  })

  const avgDays = list.length
    ? Math.round(list.reduce((s, a) => s + stayDays(a.inAt, a.outAt), 0) / list.length)
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="归档总数" value={all.length} accent="text-primary" />
        <Stat label="当前筛选" value={list.length} accent="text-chart-1" />
        <Stat label="平均住院天数" value={avgDays} accent="text-chart-5" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Archive className="size-4 text-primary" /> 住院归档
          </h2>
          <Button size="sm" variant="outline" onClick={() => {
            const rows = list.map((a) => [a.admissionNo, patientName(a.patientId), a.inAt, a.outAt ?? '', String(stayDays(a.inAt, a.outAt)), a.diagnosis, a.doctor, a.outcome ? OUTCOME_LABEL[a.outcome] : '', a.archivedAt ?? ''])
            exportCSV(['住院号','患者','入院','出院','天数','诊断','医生','转归','归档时间'], rows, '住院归档')
          }}>
            <Download className="size-4" /> 导出归档
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="按患者 / 住院号 / 诊断搜索"
              className="w-64 pl-8"
            />
          </div>
          <button
            onClick={() => setOutcome('all')}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs transition-colors',
              outcome === 'all' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
            )}
          >
            全部转归
          </button>
          {(Object.keys(OUTCOME_LABEL) as Outcome[]).map((o) => (
            <button
              key={o}
              onClick={() => setOutcome(o)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                outcome === o ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
              )}
            >
              {OUTCOME_LABEL[o]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">住院号</th>
                <th className="px-3 py-2 font-medium">患者</th>
                <th className="px-3 py-2 font-medium">入院时间</th>
                <th className="px-3 py-2 font-medium">出院时间</th>
                <th className="px-3 py-2 font-medium">天数</th>
                <th className="px-3 py-2 font-medium">诊断</th>
                <th className="px-3 py-2 font-medium">医生</th>
                <th className="px-3 py-2 font-medium">床位</th>
                <th className="px-3 py-2 font-medium">转归</th>
                <th className="px-3 py-2 font-medium">归档时间</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.admissionNo} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{a.admissionNo}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{patientName(a.patientId)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.inAt}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.outAt}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{stayDays(a.inAt, a.outAt)} 天</td>
                  <td className="px-3 py-2.5 text-foreground">{a.diagnosis}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.doctor}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {a.bedId ? `${wardName(a.bedId.split('-')[0])}` : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    {a.outcome && (
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-[10px]',
                          a.outcome === 'cured' ? 'bg-chart-5/10 text-chart-5' :
                          a.outcome === 'improved' ? 'bg-chart-1/10 text-chart-1' :
                          a.outcome === 'deceased' ? 'bg-destructive/10 text-destructive' :
                          'bg-muted text-muted-foreground',
                        )}
                      >
                        {OUTCOME_LABEL[a.outcome]}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.archivedAt}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    暂无归档记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          出院后患者记录自动转为历史档案，病床状态更新为"待消毒"；归档数据支持按转归、时间范围检索与导出。
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold tabular-nums', accent)}>{value}</p>
    </div>
  )
}
