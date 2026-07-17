import { AdminShell } from '@/components/admin/admin-shell'
import { ApprovalsView } from '@/components/admin/approvals-view'

export default function ApprovalsPage() {
  return (
    <AdminShell
      title="申请与委托"
      description="权限申请、临时委托授权的申请—审批—授予闭环，委托到期自动回收。"
    >
      <ApprovalsView />
    </AdminShell>
  )
}
