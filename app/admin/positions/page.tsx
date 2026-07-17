import { AdminShell } from '@/components/admin/admin-shell'
import { PositionsView } from '@/components/admin/positions-view'

export default function PositionsPage() {
  return (
    <AdminShell
      title="岗位管理"
      description="岗位信息与排序管理，明确人员职责与权限，支持开启 / 关闭状态控制。"
    >
      <PositionsView />
    </AdminShell>
  )
}
