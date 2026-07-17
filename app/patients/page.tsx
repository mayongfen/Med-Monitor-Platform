import { AdminShell } from '@/components/admin/admin-shell'
import { PatientView } from '@/components/patients/patient-view'

export default function PatientsPage() {
  return (
    <AdminShell
      title="患者档案"
      description="患者个人信息管理，支持 OCR 身份证录入、拼音首字母检索与过敏史 / 病史高级查询。"
    >
      <PatientView />
    </AdminShell>
  )
}
