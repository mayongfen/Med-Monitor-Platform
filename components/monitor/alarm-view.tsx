'use client'

import { useState } from 'react'
import { BellRing, CheckCircle2, Ban, Share2 } from 'lucide-react'
import {
  ALARM_RECORDS,
  ALARM_TYPE_LABEL,
  ALARM_LEVEL_META,
  ALARM_STATUS_LABEL,
  ALARM_STATUS_META,
  type AlarmRecord,
  type AlarmStatus,
} from '@/lib/alarm-data'
import { patientName } from '@/lib/patient-data'
import { wardName } from '@/lib/ward-data'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export function AlarmView() {
  const [tab, setTab] = useState<AlarmStatus | 'all'>('pending')
  const [records, setRecords] = useState<AlarmRecord[]>(ALARM_RECORDS)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const list = records.filter((a) => (tab === 'all' ? true : a.status === tab))

  function handle(id: string, result: string) {
    setRecords((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: result === '已忽略' ? 'ignored' : 'handled', handler: '王芳', result } : a,
      ),
    )
    setSelected((prev) => {
      const n = new Set(prev)
      n.delete(id)
      return n
    })
  }

  function batchHandle(result: string) {
    const ids = Array.from(selected)
    setRecords((prev) =>
      prev.map((a) =>
        ids.includes(a.id) ? { ...a, status: result === '已忽略' ? 'ignored' : 'handled', handler: '王芳', result } : a,
      ),
    )
    setSelected(new Set())
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const pendingIds = list.filter((a) => a.status === 'pending').map((a) => a.id)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BellRing className="size-4 text-destructive" /> 告警管理
        </h2>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">已选 {selected.size} 条</span>
              <button
                onClick={() => batchHandle('已处理')}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
              >
                <CheckCircle2 className="size-3.5" /> 批量确认
              </button>
              <button
                onClick={() => batchHandle('已忽略')}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                <Ban className="size-3.5" /> 批量忽略
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
          {(['pending', 'handled', 'ignored', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1 transition-colors',
                tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {t === 'all' ? '全部' : ALARM_STATUS_LABEL[t]}
            </button>
          ))}
        </div>
        {pendingIds.length > 0 && (
          <button
            onClick={() => setSelected(new Set(pendingIds))}
            className="text-xs text-primary hover:underline"
          >
            全选未处理 {pendingIds.length} 条
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="w-8 px-2 py-2"></th>
              <th className="px-2 py-2 font-medium">告警编号</th>
              <th className="px-3 py-2 font-medium">患者/床位</th>
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">级别</th>
              <th className="px-3 py-2 font-medium">告警内容</th>
              <th className="px-3 py-2 font-medium">触发时间</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">处理人/结果</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const meta = ALARM_LEVEL_META[a.level]
              const isPending = a.status === 'pending'
              return (
                <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                  <td className="px-2 py-2.5">
                    {isPending && (
                      <Checkbox
                        checked={selected.has(a.id)}
                        onCheckedChange={() => toggle(a.id)}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2.5 font-mono text-xs text-muted-foreground">{a.id}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className="text-foreground">{patientName(a.patientId)}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {wardName(a.bedId.split('-')[0])} · {a.bedId.split('-').slice(-1)[0]}床
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="secondary" className="text-[10px]">{ALARM_TYPE_LABEL[a.type]}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]', meta.cls)}>
                      <span className={cn('size-1.5 rounded-full', meta.dot, a.level === 'critical' && 'animate-pulse')} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-foreground">{a.message}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{a.raisedAt}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px]', ALARM_STATUS_META[a.status].cls)}>
                      {ALARM_STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {a.handler ? `${a.handler} · ${a.result}` : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    {isPending ? (
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => handle(a.id, '已处理')} className="inline-flex items-center gap-0.5 text-chart-5 hover:underline">
                          <CheckCircle2 className="size-3" /> 确认
                        </button>
                        <span className="text-border">|</span>
                        <button onClick={() => handle(a.id, '已忽略')} className="inline-flex items-center gap-0.5 text-muted-foreground hover:underline">
                          <Ban className="size-3" /> 忽略
                        </button>
                        <span className="text-border">|</span>
                        <button onClick={() => handle(a.id, '已转接医生')} className="inline-flex items-center gap-0.5 text-primary hover:underline">
                          <Share2 className="size-3" /> 转接
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">已处理</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        告警规则：心率 &gt; 160 或 &lt; 40 次/分；信号丢失 &gt; 30 秒；持续离床 &gt; 15 分钟（可配置）。支持单条与批量处理。
      </p>
    </div>
  )
}
