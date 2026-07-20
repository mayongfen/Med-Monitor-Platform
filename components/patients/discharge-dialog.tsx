'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DictSelect, dictOptions } from '@/components/ui/dict-select'
import { Input } from '@/components/ui/input'
import { OUTCOME_LABEL, type Outcome } from '@/lib/patient-data'
import { toast } from 'sonner'

export function DischargeDialog({
  open,
  onOpenChange,
  admissionNo,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  admissionNo: string | null
}) {
  const { admissions, discharge } = useStore()
  const [outcome, setOutcome] = useState<Outcome>('cured')
  const [outAt, setOutAt] = useState(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')} ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
  })

  const adm = admissions.find((a) => a.admissionNo === admissionNo)

  function submit() {
    if (!admissionNo) return
    discharge(admissionNo, outAt, outcome)
    toast.success('出院办理成功：设备已解绑、床位转待消毒、记录已归档')
    onOpenChange(false)
  }

  if (!adm) return null

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="办理出院"
      description={`将自动解绑设备、床位转为"待消毒"、患者记录转为历史档案。`}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="destructive" onClick={submit}>确认出院</Button>
        </>
      }
    >
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <p><span className="text-muted-foreground">住院号：</span>{adm.admissionNo}</p>
        <p><span className="text-muted-foreground">诊断：</span>{adm.diagnosis}</p>
        <p><span className="text-muted-foreground">床位：</span>{adm.bedId ?? '—'} · 设备 {adm.deviceId ?? '—'}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="outat">出院时间</Label>
          <Input id="outat" value={outAt} onChange={(e) => setOutAt(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>转归</Label>
          <DictSelect
            value={outcome}
            onValueChange={(v) => setOutcome(v as Outcome)}
            options={dictOptions(OUTCOME_LABEL)}
          />
        </div>
      </div>
    </FormDialog>
  )
}
