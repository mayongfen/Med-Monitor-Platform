import { AdminShell } from '@/components/admin/admin-shell'
import { WaterBoardView } from '@/components/monitor/water-board-view'

export default function WaterPage() {
  return (
    <AdminShell
      title="电子水牌"
      description="病区实时监护总览，患者信息脱敏显示，设备状态与未处理告警颜色区分。"
    >
      <WaterBoardView />
    </AdminShell>
  )
}
