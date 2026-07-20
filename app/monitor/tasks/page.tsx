import { AdminShell } from '@/components/admin/admin-shell'
import { TaskView } from '@/components/monitor/task-view'

export default function MonitorTasksPage() {
  return (
    <AdminShell
      description="护士巡视、翻身、体征记录等计划性监护任务管理，入院自动生成、出院自动终止。"
    >
      <TaskView />
    </AdminShell>
  )
}
