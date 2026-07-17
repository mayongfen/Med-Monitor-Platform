'use client'

import { useState } from 'react'
import { SlidersHorizontal, Plus, Pencil } from 'lucide-react'
import {
  ALARM_RULES,
  OP_LABEL,
  RULE_TYPE_LABEL,
  ruleStats,
  type AlarmRule,
} from '@/lib/alarm-rule-data'
import { ALARM_LEVEL_META } from '@/lib/alarm-data'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export function RuleView() {
  const [rules, setRules] = useState<AlarmRule[]>(ALARM_RULES)
  const stats = ruleStats()

  function toggle(id: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="规则总数" value={stats.total} accent="text-primary" />
        <Stat label="启用中" value={stats.enabled} accent="text-chart-5" />
        <Stat label="已停用" value={stats.total - stats.enabled} accent="text-muted-foreground" />
        <Stat label="危急级规则" value={stats.critical} accent="text-destructive" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="size-4 text-primary" /> 告警规则配置
          </h2>
          <Button size="sm">
            <Plus className="size-4" /> 新增规则
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap gap-3">
          {stats.byType.map((t) => (
            <span key={t.type} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {t.label}
              <span className="font-medium text-foreground">{t.enabled}/{t.total}</span>
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">规则编码</th>
                <th className="px-3 py-2 font-medium">规则名称</th>
                <th className="px-3 py-2 font-medium">类型</th>
                <th className="px-3 py-2 font-medium">触发条件</th>
                <th className="px-3 py-2 font-medium">级别</th>
                <th className="px-3 py-2 font-medium">启用</th>
                <th className="px-3 py-2 font-medium">备注</th>
                <th className="px-3 py-2 font-medium">更新时间</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => {
                const meta = ALARM_LEVEL_META[r.level]
                return (
                  <tr key={r.id} className={cn('border-b border-border/60 last:border-0 hover:bg-muted/50', !r.enabled && 'opacity-60')}>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{r.name}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {RULE_TYPE_LABEL[r.type]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-foreground">
                      {r.metric} <span className="text-muted-foreground">{OP_LABEL[r.op]}</span> {r.value} {r.unit}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]', meta.cls)}>
                        <span className={cn('size-1.5 rounded-full', meta.dot, r.level === 'critical' && 'animate-pulse')} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Switch checked={r.enabled} onCheckedChange={() => toggle(r.id)} />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.remark}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.updatedAt}</td>
                    <td className="px-3 py-2.5">
                      <button className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <Pencil className="size-3" /> 编辑
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          规则按「指标 + 操作符 + 阈值 + 级别」组合定义；机构可调整阈值与启用状态，离床时长与信号丢失阈值均可配置。
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
