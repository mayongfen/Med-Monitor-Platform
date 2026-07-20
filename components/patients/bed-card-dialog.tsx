'use client'

import { useRef } from 'react'
import { Printer } from 'lucide-react'
import { CONTACT_RELATION_LABEL } from '@/lib/patient-data'
import { wardName, BED_TYPE_LABEL } from '@/lib/ward-data'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'

export function BedCardDialog({
  open,
  onOpenChange,
  bedId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  bedId: string | null
}) {
  const { beds, patients } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const bed = beds.find((b) => b.id === bedId)
  if (!bed) return null
  const patient = bed.patientId ? patients.find((p) => p.id === bed.patientId) : undefined

  function print() {
    window.print()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="床头卡"
      description={`${bed.id} · ${bed.code}床 · ${BED_TYPE_LABEL[bed.type]}`}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
          <Button onClick={print}><Printer className="size-4" /> 打印</Button>
        </>
      }
    >
      <div ref={ref} className="rounded-lg border-2 border-primary p-4">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{wardName(bed.wardId)} · {bed.code}床</p>
          <p className="text-xs text-muted-foreground">{BED_TYPE_LABEL[bed.type]}</p>
        </div>
        <div className="mt-3 space-y-1.5 text-sm">
          <Row label="姓名" value={patient ? patient.name : '—'} />
          <Row label="性别" value={patient?.gender ?? '—'} />
          <Row label="年龄" value={patient ? `${patient.age}岁` : '—'} />
          <Row label="身份证" value={patient?.idCard ?? '—'} />
          <Row label="过敏史" value={patient?.allergy ?? '无'} />
          {patient?.contacts?.length ? (
            patient.contacts.map((c, i) => {
              const rel = c.relation ? CONTACT_RELATION_LABEL[c.relation] : '联系人'
              return (
                <Row key={i} label={`紧急联系${patient.contacts.length > 1 ? i + 1 : ''}`} value={`${c.name}（${rel}）${c.phone}`} />
              )
            })
          ) : (
            <Row label="紧急联系" value="—" />
          )}
        </div>
      </div>
    </FormDialog>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/40 py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
