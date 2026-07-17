import { AdminShell } from '@/components/admin/admin-shell'
import { AuditView } from '@/components/admin/audit-view'

export default function AuditPage() {
  return (
    <AdminShell
      title="审计日志"
      description="六类日志独立落库并自动脱敏，支持按类别、关键字与 TraceId 检索。"
    >
      <AuditView />
    </AdminShell>
  )
}
