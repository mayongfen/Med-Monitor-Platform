'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DictSelect, dictOptions } from '@/components/ui/dict-select'
import { toast } from 'sonner'
import { BED_STATUS_LABEL, type BedStatus } from '@/lib/ward-data'

export function BedActionDialog({
  open,
  onOpenChange,
  bedId,
  mode,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  bedId: string | null
  mode: 'assign' | 'change' | 'unbind' | 'status'
}) {
  const { beds, patients, devices, assignBed, unassignBed, setBedStatus } = useStore()
  const [patientId, setPatientId] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [status, setStatus] = useState<BedStatus>('idle')

  const bed = beds.find((b) => b.id === bedId)
  if (!bed) return null

  const idlePatients = patients.filter((p) => !beds.some((b) => b.patientId === p.id))
  const standbyDevices = devices.filter((d) => d.status === 'standby')

  function submit() {
    if (!bedId) return
    if (mode === 'assign' || mode === 'change') {
      if (!patientId) return toast.error('请选择患者')
      assignBed(bedId, patientId, deviceId || undefined)
      toast.success(mode === 'assign' ? '患者已分配床位' : '换床完成')
    } else if (mode === 'unbind') {
      unassignBed(bedId, 'disinfect')
      toast.success('已解绑，床位转为待消毒')
    } else {
      setBedStatus(bedId, status)
      toast.success('床位状态已更新')
    }
    onOpenChange(false)
    setPatientId(''); setDeviceId('')
  }

  const titles: Record<string, string> = {
    assign: '分配患者',
    change: '换床',
    unbind: '解绑床位',
    status: '设置床位状态',
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={titles[mode]}
      description={`床位：${bed.id} · ${bed.code}床 · 当前状态：${bed.status}`}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant={mode === 'unbind' ? 'destructive' : 'default'} onClick={submit}>
            {mode === 'unbind' ? '确认解绑' : '确认'}
          </Button>
        </>
      }
    >
      {(mode === 'assign' || mode === 'change') && (
        <>
          <div className="flex flex-col gap-2">
            <Label>患者（仅显示未占用床位者）</Label>
            <DictSelect
              value={patientId}
              onValueChange={setPatientId}
              options={idlePatients.map((p) => ({ value: p.id, label: `${p.id} · ${p.name}` }))}
              placeholder="选择患者"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>监护设备（可选）</Label>
            <DictSelect
              value={deviceId}
              onValueChange={setDeviceId}
              options={standbyDevices.map((d) => ({ value: d.id, label: `${d.code} · ${d.model}` }))}
              placeholder="不绑定"
            />
          </div>
        </>
      )}
      {mode === 'status' && (
        <div className="flex flex-col gap-2">
          <Label>新状态</Label>
          <DictSelect
            value={status}
            onValueChange={(v) => setStatus(v as BedStatus)}
            options={dictOptions(BED_STATUS_LABEL)}
          />
        </div>
      )}
      {mode === 'unbind' && (
        <p className="text-sm text-muted-foreground">
          解绑后床位将转为"待消毒"，患者与设备关联同时解除。
        </p>
      )}
    </FormDialog>
  )
}
