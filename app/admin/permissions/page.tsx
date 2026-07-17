import { AdminShell } from '@/components/admin/admin-shell'
import { PermissionsView } from '@/components/admin/permissions-view'

export default function PermissionsPage() {
  return (
    <AdminShell
      title="权限矩阵"
      description="RBAC + ABAC 融合：权限码、角色继承、数据范围、字段脱敏与动态职责分离一览。"
    >
      <PermissionsView />
    </AdminShell>
  )
}
