'use client'

import { useState } from 'react'
import { SlidersHorizontal, Plus, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { OP_LABEL, RULE_TYPE_LABEL, ruleStats, type AlarmRule } from '@/lib/alarm-rule-data'
import { ROLE_CODE_LABEL, type RoleCode } from '@/lib/admin-data'
import { ALARM_LEVEL_META } from '@/lib/alarm-data'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { RuleDialog } from './rule-dialog'
import { useConfirm } from '@/components/ui/form-dialog'
import { toast } from 'sonner'

export function RuleView() {
  const { rules, toggleRule, removeRule } = useStore()
  const [dialog, setDialog] = useState<{ open: boolean; rule: AlarmRule | null }>({ open: false, rule: null })
  const { confirm, dialog: confirmDialog } = useConfirm()
  const stats = ruleStats()

  async function handleDelete(r: AlarmRule) {
    const ok = await confirm({ title: '删除规则？', description: `${r.name} 删除后不可恢复。`, variant: 'destructive' })
    if (ok) { removeRule(r.id); toast.success('规则已删除') }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="规则总数" value={rules.length} accent="text-primary" />
        <Stat label="启用中" value={rules.filter((r) => r.enabled).length} accent="text-chart-5" />
        <Stat label="已停用" value={rules.filter((r) => !r.enabled).length} accent="text-muted-foreground" />
        <Stat label="危急级" value={rules.filter((r) => r.level === 'critical').length} accent="text-destructive" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="size-4 text-primary" /> 告警规则配置
          </h2>
          <Button size="sm" onClick={() => setDialog({ open: true, rule: null })}>
            <Plus className="size-4" /> 新增规则
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap gap-3">
          {stats.byType.map((t) => {
            const enabled = rules.filter((r) => r.type === t.type && r.enabled).length
            const total = rules.filter((r) => r.type === t.type).length
            return (
              <span key={t.type} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                {t.label} <span className="font-medium text-foreground">{enabled}/{total}</span>
              </span>
            )
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">规则编码</th>
                <th className="px-3 py-2 font-medium">名称</th>
                <th className="px-3 py-2 font-medium">类型</th>
                <th className="px-3 py-2 font-medium">触发条件</th>
                <th className="px-3 py-2 font-medium">级别</th>
                <th className="px-3 py-2 font-medium">通知角色</th>
                <th className="px-3 py-2 font-medium">启用</th>
                <th className="px-3 py-2 font-medium">备注</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => {
                const meta = ALARM_LEVEL_META[r.level]
                return (
                  <tr key={r.id} className={cn('border-b border-border/60 last:border-0 hover:bg-muted/50', !r.enabled && 'opacity-60')}>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-3 py-2.5 font-medium text-foreground">{r.name}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{RULE_TYPE_LABEL[r.type]}</span>
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
                      {r.notifyRoles && r.notifyRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.notifyRoles.map((rc) => (
                            <span key={rc} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {ROLE_CODE_LABEL[rc as RoleCode]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">全部角色</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Switch checked={r.enabled} onCheckedChange={() => toggleRule(r.id)} />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.remark}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => setDialog({ open: true, rule: r })} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Pencil className="size-3" /> 编辑
                        </button>
                        <button onClick={() => handleDelete(r)} className="inline-flex items-center gap-1 text-destructive hover:underline">
                          <Trash2 className="size-3" /> 删除
                        </button>
                      </div>
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

      <RuleDialog open={dialog.open} onOpenChange={(o) => setDialog((s) => ({ ...s, open: o }))} rule={dialog.rule} />
      {confirmDialog}
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
