import { AdminShell } from '@/components/admin/admin-shell'
import { UsersView } from '@/components/admin/users-view'

export default function UsersPage() {
  return (
    <AdminShell title="用户管理" description="管理平台与各租户下的用户账户、角色分配与安全状态。">
      <UsersView />
    </AdminShell>
  )
}
