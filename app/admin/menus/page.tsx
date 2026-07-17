import { AdminShell } from '@/components/admin/admin-shell'
import { MenusView } from '@/components/admin/menus-view'

export default function MenusPage() {
  return (
    <AdminShell
      title="菜单管理"
      description="目录 / 菜单 / 按钮三级结构与权限码统一维护，遵循 resource:action:scope 规范。"
    >
      <MenusView />
    </AdminShell>
  )
}
