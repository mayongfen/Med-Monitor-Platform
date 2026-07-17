import { AdminShell } from '@/components/admin/admin-shell'
import { HomeView } from '@/components/home/home-view'

export default function Page() {
  return (
    <AdminShell
      title="系统首页"
      description="机构版非接触式智能监护系统 · 人员、床位、设备与告警实时总览。"
    >
      <HomeView />
    </AdminShell>
  )
}
