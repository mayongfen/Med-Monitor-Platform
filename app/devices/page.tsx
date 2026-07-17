import { AdminShell } from '@/components/admin/admin-shell'
import { DeviceView } from '@/components/devices/device-view'

export default function DevicesPage() {
  return (
    <AdminShell
      title="设备库存"
      description="监护垫设备入库、库存统计、设备溯源与病床绑定管理，直线折旧法资产核算。"
    >
      <DeviceView />
    </AdminShell>
  )
}
