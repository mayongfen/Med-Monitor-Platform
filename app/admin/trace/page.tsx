import { AdminShell } from '@/components/admin/admin-shell'
import { TraceView } from '@/components/admin/trace-view'

export default function TracePage() {
  return (
    <AdminShell
      title="链路追踪"
      description="按 TraceId 贯穿网关、鉴权、业务与审计服务，还原完整请求轨迹与耗时瀑布。"
    >
      <TraceView />
    </AdminShell>
  )
}
