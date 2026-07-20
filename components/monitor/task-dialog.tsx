'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DictSelect, dictOptions } from '@/components/ui/dict-select'
import { toast } from 'sonner'
import { TASK_TYPE_LABEL, TASK_STATUS_LABEL, SHIFT_LABEL, type MonitorTask, type TaskType, type Shift } from '@/lib/monitor-task-data'
import { wardName } from '@/lib/ward-data'
import { patientName } from '@/lib/patient-data'

// ── 执行任务对话框 ──────────────────────────────────────

export function TaskExecuteDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  task: MonitorTask | null
}) {
  const { completeTask, cancelTask } = useStore()
  const [result, setResult] = useState('')

  useEffect(() => {
    if (task) setResult('')
  }, [task, open])

  if (!task) return null

  function submit() {
    if (!result.trim()) return toast.error('请填写执行记录')
    completeTask(task!.id, result.trim(), '当前用户')
    toast.success('任务已执行完成')
    onOpenChange(false)
  }

  function skip() {
    cancelTask(task!.id, '手动跳过')
    toast.info('任务已跳过')
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="执行监护任务"
      description={`${task.type === 'assess' ? '入科评估' : TASK_TYPE_LABEL[task.type]} · ${task.patientName}（${wardName(task.wardId)} ${task.bedId.split('-').slice(-1)[0]}床）`}
      footer={
        <>
          <Button variant="outline" onClick={skip}>跳过</Button>
          <Button onClick={submit}>确认执行</Button>
        </>
      }
    >
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <div className="grid grid-cols-2 gap-y-1.5">
          <span className="text-muted-foreground">任务编号</span>
          <span className="font-mono text-xs text-foreground">{task.id}</span>
          <span className="text-muted-foreground">计划时间</span>
          <span className="text-foreground">{task.scheduledAt}</span>
          <span className="text-muted-foreground">截止时间</span>
          <span className="text-foreground">{task.deadline}</span>
          <span className="text-muted-foreground">负责人</span>
          <span className="text-foreground">{task.assigneeName}</span>
          <span className="text-muted-foreground">班次</span>
          <span className="text-foreground">{SHIFT_LABEL[task.shift]}</span>
          <span className="text-muted-foreground">当前状态</span>
          <span className="text-foreground">{TASK_STATUS_LABEL[task.status]}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="result">执行记录</Label>
        <Textarea
          id="result"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="记录执行情况，如：患者意识清醒，生命体征平稳，无不适主诉…"
          rows={4}
        />
      </div>
    </FormDialog>
  )
}

// ── 新建任务对话框 ──────────────────────────────────────

export function TaskCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { beds, addTask } = useStore()
  const [type, setType] = useState<TaskType>('round')
  const [bedId, setBedId] = useState('')
  const [scheduledAt, setScheduledAt] = useState(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')} ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
  })
  const [assigneeName, setAssigneeName] = useState('')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    if (open) {
      setType('round'); setBedId(''); setAssigneeName(''); setRemark('')
      const n = new Date()
      setScheduledAt(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')} ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`)
    }
  }, [open])

  const occupiedBeds = beds.filter((b) => b.status === 'occupied' && b.patientId)

  function submit() {
    if (!bedId) return toast.error('请选择床位')
    if (!assigneeName.trim()) return toast.error('请填写负责人')
    const bed = beds.find((b) => b.id === bedId)
    if (!bed?.patientId) return toast.error('该床位无患者')
    const [date, time] = scheduledAt.split(' ')
    const [h] = time.split(':').map(Number)
    const shift: Shift = h >= 8 && h < 16 ? 'day' : h >= 16 && h < 24 ? 'evening' : 'night'
    const deadlineDate = new Date(date + 'T' + time)
    deadlineDate.setMinutes(deadlineDate.getMinutes() + 30)
    addTask({
      type,
      patientId: bed.patientId,
      patientName: patientName(bed.patientId),
      bedId,
      wardId: bed.wardId,
      scheduledAt,
      deadline: `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')} ${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`,
      assigneeName: assigneeName.trim(),
      shift,
      source: 'manual',
      result: remark.trim() || undefined,
    })
    toast.success('任务已创建')
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="新建监护任务"
      description="手动创建临时任务，提交后立即出现在待执行列表中。"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}>创建任务</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>任务类型</Label>
          <DictSelect
            value={type}
            onValueChange={(v) => setType(v as TaskType)}
            options={dictOptions(TASK_TYPE_LABEL)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sched">计划时间</Label>
          <Input id="sched" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} placeholder="2026-07-18 10:00" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>床位（仅显示已占用）</Label>
        <DictSelect
          value={bedId}
          onValueChange={setBedId}
          options={occupiedBeds.map((b) => ({ value: b.id, label: `${b.id} · ${b.code}床 · ${patientName(b.patientId)}` }))}
          placeholder="选择床位"
        />
        {occupiedBeds.length === 0 && <p className="text-xs text-destructive">当前无已占用床位</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="assignee">负责人</Label>
          <Input id="assignee" value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} placeholder="如：王芳" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="remark">备注（可选）</Label>
          <Input id="remark" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="任务说明" />
        </div>
      </div>
    </FormDialog>
  )
}
