import { AdminShell } from '@/components/admin/admin-shell'
import { WardView } from '@/components/ward/ward-view'

export default function WardPage() {
  return (
    <AdminShell
      title="病区管理"
      description="病区基本信息、床位配置与设备配额管理，支持多条件筛选与 Excel 导出。"
    >
      <WardView />
    </AdminShell>
  )
}
