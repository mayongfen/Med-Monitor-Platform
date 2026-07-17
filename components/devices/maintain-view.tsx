'use client'

import { Wrench, Plus, AlertTriangle } from 'lucide-react'
import { DEVICES_LIFECYCLE, MAINTAIN_LOGS, depreciation } from '@/lib/device-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NOW = new Date('2026-07-18').getTime()

export function MaintainView() {
  return (
    <div className="space-y-4">
      {/* 维护计划 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wrench className="size-4 text-primary" /> 维护计划
          </h2>
          <Button size="sm">
            <Plus className="size-4" /> 新建计划
          </Button>
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
              {DEVICES_LIFECYCLE.map((d) => {
                const due = new Date(d.maintainDueAt).getTime()
                const daysLeft = Math.round((due - NOW) / (1000 * 60 * 60 * 24))
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
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          传感器更换周期默认 1 年；预防性维护到期自动提醒，逾期设备标记并通知保管人。
        </p>
      </div>

      {/* 维护记录 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">维护记录</h2>
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
              {MAINTAIN_LOGS.map((m) => {
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
