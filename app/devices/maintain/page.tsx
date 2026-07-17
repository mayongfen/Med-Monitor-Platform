import { AdminShell } from '@/components/admin/admin-shell'
import { MaintainView } from '@/components/devices/maintain-view'

export default function MaintainPage() {
  return (
    <AdminShell
      title="维护保养"
      description="传感器定期维护计划、维护记录与设备报废管理。"
    >
      <MaintainView />
    </AdminShell>
  )
}
