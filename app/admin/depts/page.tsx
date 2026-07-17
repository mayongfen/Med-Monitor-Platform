import { AdminShell } from '@/components/admin/admin-shell'
import { DeptsView } from '@/components/admin/depts-view'

export default function DeptsPage() {
  return (
    <AdminShell
      title="部门管理"
      description="基于闭包表的组织架构，部门绑定数据范围，用于 RBAC 数据权限的落点计算。"
    >
      <DeptsView />
    </AdminShell>
  )
}
