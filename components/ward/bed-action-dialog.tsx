'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { BedStatus } from '@/lib/ward-data'

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
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="选择患者" /></SelectTrigger>
              <SelectContent>
                {idlePatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.id} · {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>监护设备（可选）</Label>
            <Select value={deviceId} onValueChange={setDeviceId}>
              <SelectTrigger><SelectValue placeholder="不绑定" /></SelectTrigger>
              <SelectContent>
                {standbyDevices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.code} · {d.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      {mode === 'status' && (
        <div className="flex flex-col gap-2">
          <Label>新状态</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as BedStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="idle">空闲</SelectItem>
              <SelectItem value="disinfect">消毒</SelectItem>
              <SelectItem value="maintenance">维修</SelectItem>
              <SelectItem value="reserved">预占</SelectItem>
            </SelectContent>
          </Select>
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
