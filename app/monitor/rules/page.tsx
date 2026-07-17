import { AdminShell } from '@/components/admin/admin-shell'
import { RuleView } from '@/components/monitor/rule-view'

export default function RulesPage() {
  return (
    <AdminShell
      title="告警规则"
      description="机构可配置的告警阈值规则库，按指标 / 操作符 / 阈值 / 级别组合定义，离床与信号丢失时长可调。"
    >
      <RuleView />
    </AdminShell>
  )
}
