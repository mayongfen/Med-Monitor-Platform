import { AdminShell } from '@/components/admin/admin-shell'
import { BedView } from '@/components/ward/bed-view'

export default function BedsPage() {
  return (
    <AdminShell
      title="床位管理"
      description="床位新增 / 编辑 / 删除，实时状态（空闲 / 占用 / 维修 / 消毒 / 预占）与设备绑定规则。"
    >
      <BedView />
    </AdminShell>
  )
}
