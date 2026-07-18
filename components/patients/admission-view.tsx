'use client'

import { useState } from 'react'
import { Plus, LogIn } from 'lucide-react'
import { useStore } from '@/lib/store'
import { patientName } from '@/lib/patient-data'
import { wardName } from '@/lib/ward-data'
import { ADMISSION_TYPE_LABEL, ADMISSION_STATUS_LABEL, stayDays, type AdmissionStatus } from '@/lib/patient-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AdmitDialog } from './admit-dialog'
import { DischargeDialog } from './discharge-dialog'
import { useConfirm } from '@/components/ui/form-dialog'
import { toast } from 'sonner'

export function AdmissionView() {
  const { admissions } = useStore()
  const [tab, setTab] = useState<AdmissionStatus | 'all'>('all')
  const [admitOpen, setAdmitOpen] = useState(false)
  const [dischargeNo, setDischargeNo] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  const list = admissions.filter((a) => (tab === 'all' ? true : a.status === tab))

  async function handleDischarge(admissionNo: string) {
    const ok = await confirm({
      title: '确认办理出院？',
      description: '出院后将自动解绑监护设备、床位转为"待消毒"、患者记录转为历史档案。',
      variant: 'destructive',
      confirmText: '确认出院',
    })
    if (ok) setDischargeNo(admissionNo)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <LogIn className="size-4 text-primary" /> 住院办理
        </h2>
        <Button size="sm" onClick={() => setAdmitOpen(true)}>
          <Plus className="size-4" /> 办理入院
        </Button>
      </div>

      <div className="mb-3 inline-flex rounded-lg border border-border p-0.5 text-xs">
        {(['all', 'admitted', 'discharged'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-3 py-1 transition-colors',
              tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {t === 'all' ? `全部 ${admissions.length}` : `${ADMISSION_STATUS_LABEL[t]} ${admissions.filter((a) => a.status === t).length}`}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">住院号</th>
              <th className="px-3 py-2 font-medium">患者</th>
              <th className="px-3 py-2 font-medium">入院时间</th>
              <th className="px-3 py-2 font-medium">出院时间</th>
              <th className="px-3 py-2 font-medium">天数</th>
              <th className="px-3 py-2 font-medium">诊断</th>
              <th className="px-3 py-2 font-medium">医生</th>
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">床位/设备</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.admissionNo} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{a.admissionNo}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{patientName(a.patientId)}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.inAt}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.outAt ?? '—'}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{stayDays(a.inAt, a.outAt)}天</td>
                <td className="px-3 py-2.5 text-foreground">{a.diagnosis}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.doctor}</td>
                <td className="px-3 py-2.5">
                  <Badge variant="secondary" className="text-[10px]">{ADMISSION_TYPE_LABEL[a.type]}</Badge>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                  {a.bedId ? `${wardName(a.bedId.split('-')[0])}·${a.bedId.split('-').slice(-1)[0]}床` : '—'}
                  {a.deviceId && <span className="ml-1 font-mono">{a.deviceId}</span>}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[10px]',
                      a.status === 'admitted' ? 'bg-chart-5/10 text-chart-5' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {ADMISSION_STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {a.status === 'admitted' ? (
                    <button onClick={() => handleDischarge(a.admissionNo)} className="text-xs text-destructive hover:underline">
                      办理出院
                    </button>
                  ) : (
                    <button
                      onClick={() => toast.info('已归档，可在「住院归档」查看')}
                      className="text-xs text-primary hover:underline"
                    >
                      查看归档
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        入院自动校验床位空闲并占用；出院联动解绑设备、床位转"待消毒"、记录归档；30 天内重复入院自动预警。
      </p>

      <AdmitDialog open={admitOpen} onOpenChange={setAdmitOpen} />
      <DischargeDialog open={!!dischargeNo} onOpenChange={(o) => !o && setDischargeNo(null)} admissionNo={dischargeNo} />
      {dialog}
    </div>
  )
}
