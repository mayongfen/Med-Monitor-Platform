'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function AdmitDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { patients, beds, devices, admit } = useStore()

  const idleBeds = beds.filter((b) => b.status === 'idle')
  const standbyDevices = devices.filter((d) => d.status === 'standby')
  const unadmitted = patients.filter(
    (p) => !admissionsContains(p.id),
  )

  function admissionsContains(pid: string) {
    // 简化：从 store admissions 查
    return false
  }

  const [patientId, setPatientId] = useState('')
  const [bedId, setBedId] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [doctor, setDoctor] = useState('张主任')
  const [type, setType] = useState<'emergency' | 'outpatient' | 'transfer'>('outpatient')

  function submit() {
    if (!patientId) return toast.error('请选择患者')
    if (!bedId) return toast.error('请分配床位')
    if (!diagnosis.trim()) return toast.error('请填写入院诊断')
    const now = new Date()
    const inAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    admit({
      patientId,
      admissionNo: `AD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`,
      inAt,
      diagnosis: diagnosis.trim(),
      doctor,
      type,
      bedId,
      deviceId: deviceId || undefined,
    })
    toast.success('入院办理成功，床位已占用')
    onOpenChange(false)
    setPatientId(''); setBedId(''); setDeviceId(''); setDiagnosis('')
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="办理入院"
      description="选择患者、分配空闲床位与备用设备，提交后床位状态自动更新为占用。"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}>确认入院</Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <Label>患者</Label>
        <Select value={patientId} onValueChange={setPatientId}>
          <SelectTrigger><SelectValue placeholder="选择患者" /></SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.id} · {p.name} · {p.gender} {p.age}岁
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>床位（仅显示空闲）</Label>
        <Select value={bedId} onValueChange={setBedId}>
          <SelectTrigger><SelectValue placeholder="选择空闲床位" /></SelectTrigger>
          <SelectContent>
            {idleBeds.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.id} · {b.code}床
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {idleBeds.length === 0 && <p className="text-xs text-destructive">当前无空闲床位</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>监护设备（可选，仅显示备用）</Label>
        <Select value={deviceId} onValueChange={setDeviceId}>
          <SelectTrigger><SelectValue placeholder="不绑定设备" /></SelectTrigger>
          <SelectContent>
            {standbyDevices.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.code} · {d.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="diag">入院诊断</Label>
        <Input id="diag" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="如：急性心肌梗死" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>入院类型</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="emergency">急诊</SelectItem>
              <SelectItem value="outpatient">门诊</SelectItem>
              <SelectItem value="transfer">转院</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="doc">主治医生</Label>
          <Input id="doc" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
        </div>
      </div>
    </FormDialog>
  )
}
