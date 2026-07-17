import { AdminShell } from '@/components/admin/admin-shell'
import { AlarmView } from '@/components/monitor/alarm-view'

export default function AlarmsPage() {
  return (
    <AdminShell
      title="告警管理"
      description="告警触发规则可配置（生理阈值 / 信号丢失 / 离床时长），支持单条与批量处理。"
    >
      <AlarmView />
    </AdminShell>
  )
}
