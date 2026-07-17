import { AdminShell } from '@/components/admin/admin-shell'
import { RolesView } from '@/components/admin/roles-view'

export default function RolesPage() {
  return (
    <AdminShell
      title="角色管理"
      description="基于闭包表的角色层级继承，支持数据范围（本人 / 部门 / 租户）与权限分配。"
    >
      <RolesView />
    </AdminShell>
  )
}
