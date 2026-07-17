import { AdminShell } from '@/components/admin/admin-shell'
import { ArchiveView } from '@/components/patients/archive-view'

export default function ArchivePage() {
  return (
    <AdminShell
      title="住院归档"
      description="出院患者历史档案库，按转归与时间范围检索，支持归档导出与平均住院天数统计。"
    >
      <ArchiveView />
    </AdminShell>
  )
}
