import { AdminShell } from '@/components/admin/admin-shell'
import { AdmissionView } from '@/components/patients/admission-view'

export default function AdmissionPage() {
  return (
    <AdminShell
      title="住院办理"
      description="住院信息录入、床位分配、出院解绑与数据归档，30 天内重复入院自动预警。"
    >
      <AdmissionView />
    </AdminShell>
  )
}
