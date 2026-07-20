'use client'

import { useMemo, useState } from 'react'
import { Wrench, Plus, AlertTriangle, Search, ClipboardList } from 'lucide-react'
import { DEVICES_LIFECYCLE, MAINTAIN_LOGS, depreciation } from '@/lib/device-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const NOW = new Date('2026-07-18').getTime()

type PlanFilter = 'all' | 'overdue' | 'near' | 'normal'
type LogFilter = 'all' | 'parts' | 'no-parts'

function daysLeftOf(dueAt: string) {
  return Math.round((new Date(dueAt).getTime() - NOW) / (1000 * 60 * 60 * 24))
}

export function MaintainView() {
  const [planKeyword, setPlanKeyword] = useState('')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [logKeyword, setLogKeyword] = useState('')
  const [logFilter, setLogFilter] = useState<LogFilter>('all')

  const planStats = useMemo(() => {
    let overdue = 0
    let near = 0
    DEVICES_LIFECYCLE.forEach((d) => {
      const days = daysLeftOf(d.maintainDueAt)
      if (days < 0) overdue++
      else if (days <= 30) near++
    })
    return { overdue, near, normal: DEVICES_LIFECYCLE.length - overdue - near }
  }, [])

  const planList = useMemo(() => {
    const kw = planKeyword.trim().toLowerCase()
    return DEVICES_LIFECYCLE.filter((d) => {
      if (kw && !d.code.toLowerCase().includes(kw) && !d.model.toLowerCase().includes(kw) && !d.keeper.toLowerCase().includes(kw)) return false
      const days = daysLeftOf(d.maintainDueAt)
      const isOverdue = days < 0
      const isNear = days >= 0 && days <= 30
      if (planFilter === 'overdue' && !isOverdue) return false
      if (planFilter === 'near' && !isNear) return false
      if (planFilter === 'normal' && (isOverdue || isNear)) return false
      return true
    })
  }, [planKeyword, planFilter])

  const logStats = useMemo(() => {
    const parts = MAINTAIN_LOGS.filter((m) => m.parts !== '—').length
    return { parts, noParts: MAINTAIN_LOGS.length - parts }
  }, [])

  const logList = useMemo(() => {
    const kw = logKeyword.trim().toLowerCase()
    return MAINTAIN_LOGS.filter((m) => {
      const dev = DEVICES_LIFECYCLE.find((d) => d.id === m.deviceId)
      if (kw) {
        const code = dev?.code ?? m.deviceId
        if (!m.id.toLowerCase().includes(kw) && !code.toLowerCase().includes(kw) && !m.content.toLowerCase().includes(kw) && !m.operator.toLowerCase().includes(kw) && !m.parts.toLowerCase().includes(kw)) return false
      }
      const hasParts = m.parts !== '—'
      if (logFilter === 'parts' && !hasParts) return false
      if (logFilter === 'no-parts' && hasParts) return false
      return true
    })
  }, [logKeyword, logFilter])

  return (
    <Tabs defaultValue="plan">
      <TabsList>
        <TabsTrigger value="plan">
          <Wrench className="size-4" /> 维护计划
        </TabsTrigger>
        <TabsTrigger value="log">
          <ClipboardList className="size-4" /> 维护记录
        </TabsTrigger>
      </TabsList>

      {/* 维护计划 */}
      <TabsContent value="plan">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wrench className="size-4 text-primary" /> 维护计划
            </h2>
            <Button size="sm">
              <Plus className="size-4" /> 新建计划
            </Button>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={planKeyword}
                onChange={(e) => setPlanKeyword(e.target.value)}
                placeholder="搜索设备编码 / 型号 / 保管人"
                className="pl-8"
              />
            </div>
            {(['all', 'overdue', 'near', 'normal'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPlanFilter(f)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  planFilter === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
              >
                {f === 'all' ? `全部 ${DEVICES_LIFECYCLE.length}` : f === 'overdue' ? `逾期 ${planStats.overdue}` : f === 'near' ? `即将到期 ${planStats.near}` : `正常 ${planStats.normal}`}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">设备编码</th>
                  <th className="px-3 py-2 font-medium">型号</th>
                  <th className="px-3 py-2 font-medium">保管人</th>
                  <th className="px-3 py-2 font-medium">上次维护</th>
                  <th className="px-3 py-2 font-medium">下次维护</th>
                  <th className="px-3 py-2 font-medium">剩余</th>
                  <th className="px-3 py-2 font-medium">维护次数</th>
                </tr>
              </thead>
              <tbody>
                {planList.map((d) => {
                  const daysLeft = daysLeftOf(d.maintainDueAt)
                  const overdue = daysLeft < 0
                  const near = daysLeft >= 0 && daysLeft <= 30
                  const dep = depreciation(d)
                  return (
                    <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{d.code}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">{d.model}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{d.keeper}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {MAINTAIN_LOGS.filter((m) => m.deviceId === d.id).slice(-1)[0]?.at ?? '—'}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{d.maintainDueAt}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]',
                            overdue ? 'bg-destructive/10 text-destructive' : near ? 'bg-chart-4/15 text-chart-4' : 'bg-chart-5/10 text-chart-5',
                          )}
                        >
                          {overdue ? (
                            <>
                              <AlertTriangle className="size-3" /> 逾期 {-daysLeft} 天
                            </>
                          ) : (
                            `${daysLeft} 天`
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{d.maintainCount} 次 · 净值 ¥{dep.netValue.toLocaleString()}</td>
                    </tr>
                  )
                })}
                {planList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      未匹配到维护计划
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            传感器更换周期默认 1 年；预防性维护到期自动提醒，逾期设备标记并通知保管人。
          </p>
        </div>
      </TabsContent>

      {/* 维护记录 */}
      <TabsContent value="log">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardList className="size-4 text-primary" /> 维护记录
            </h2>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={logKeyword}
                onChange={(e) => setLogKeyword(e.target.value)}
                placeholder="搜索记录编号 / 设备编码 / 维护内容 / 操作人"
                className="pl-8"
              />
            </div>
            {(['all', 'parts', 'no-parts'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  logFilter === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
              >
                {f === 'all' ? `全部 ${MAINTAIN_LOGS.length}` : f === 'parts' ? `有更换部件 ${logStats.parts}` : `无更换部件 ${logStats.noParts}`}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">记录编号</th>
                  <th className="px-3 py-2 font-medium">设备编码</th>
                  <th className="px-3 py-2 font-medium">维护时间</th>
                  <th className="px-3 py-2 font-medium">维护内容</th>
                  <th className="px-3 py-2 font-medium">更换部件</th>
                  <th className="px-3 py-2 font-medium">操作人</th>
                </tr>
              </thead>
              <tbody>
                {logList.map((m) => {
                  const dev = DEVICES_LIFECYCLE.find((d) => d.id === m.deviceId)
                  return (
                    <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{m.id}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{dev?.code ?? m.deviceId}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{m.at}</td>
                      <td className="px-3 py-2.5 text-foreground">{m.content}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{m.parts}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{m.operator}</td>
                    </tr>
                  )
                })}
                {logList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      未匹配到维护记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            维护记录按设备归档，支持按编号、设备、内容与操作人检索；更换部件自动关联备件库存。
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
