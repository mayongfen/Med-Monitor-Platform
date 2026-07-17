import { AdminShell } from '@/components/admin/admin-shell'
import { TenantsView } from '@/components/admin/tenants-view'

export default function TenantsPage() {
  return (
    <AdminShell
      title="租户管理"
      description="多租户字段级隔离与版本白名单门控，支持一站式开通、停用与租户切换。"
    >
      <TenantsView />
    </AdminShell>
  )
}
