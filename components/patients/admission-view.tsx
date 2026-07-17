'use client'

import { useState } from 'react'
import { Plus, LogIn } from 'lucide-react'
import {
  ADMISSIONS,
  ADMISSION_TYPE_LABEL,
  ADMISSION_STATUS_LABEL,
  type AdmissionStatus,
} from '@/lib/patient-data'
import { patientName } from '@/lib/patient-data'
import { wardName } from '@/lib/ward-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AdmissionView() {
  const [tab, setTab] = useState<AdmissionStatus | 'all'>('all')
  const list = ADMISSIONS.filter((a) => (tab === 'all' ? true : a.status === tab))

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <LogIn className="size-4 text-primary" /> 入出院管理
        </h2>
        <Button size="sm">
          <Plus className="size-4" /> 办理入院
        </Button>
      </div>

      <div className="mb-3 inline-flex rounded-lg border border-border p-0.5 text-xs">
        {(['all', 'admitted', 'discharged'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-3 py-1 transition-colors',
              tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {t === 'all' ? '全部' : ADMISSION_STATUS_LABEL[t]}
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
              <th className="px-3 py-2 font-medium">诊断</th>
              <th className="px-3 py-2 font-medium">医生</th>
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">医保</th>
              <th className="px-3 py-2 font-medium">床位</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.admissionNo} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{a.admissionNo}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{patientName(a.patientId)}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.inAt}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.outAt ?? '—'}</td>
                <td className="px-3 py-2.5 text-foreground">{a.diagnosis}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.doctor}</td>
                <td className="px-3 py-2.5">
                  <Badge variant="secondary" className="text-[10px]">{ADMISSION_TYPE_LABEL[a.type]}</Badge>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.insurance ?? '—'}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {a.bedId ? `${wardName(a.bedId.split('-')[0])} · ${a.bedId.split('-').slice(-1)[0]}床` : '—'}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[10px]',
                      a.status === 'admitted' ? 'bg-chart-5/10 text-chart-5' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {ADMISSION_STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-2 text-xs">
                    {a.status === 'admitted' ? (
                      <button className="text-destructive hover:underline">办理出院</button>
                    ) : (
                      <span className="text-muted-foreground/60">已归档</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        入院规则：同一时间同一患者不能重复入院；床位分配时校验床位"空闲"状态并自动更新为"占用"；30 天内再次入院自动预警标记。
      </p>
    </div>
  )
}
