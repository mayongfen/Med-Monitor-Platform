'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { RULE_TYPE_LABEL, type AlarmRule, type AlarmOperator, type RuleType } from '@/lib/alarm-rule-data'

export function RuleDialog({
  open,
  onOpenChange,
  rule,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  rule?: AlarmRule | null
}) {
  const { upsertRule } = useStore()
  const isEdit = !!rule

  const [name, setName] = useState('')
  const [type, setType] = useState<RuleType>('heart')
  const [op, setOp] = useState<AlarmOperator>('gt')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('bpm')
  const [level, setLevel] = useState<'warning' | 'critical'>('warning')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    if (rule) {
      setName(rule.name); setType(rule.type); setOp(rule.op)
      setValue(String(rule.value)); setUnit(rule.unit); setLevel(rule.level); setRemark(rule.remark)
    } else {
      setName(''); setType('heart'); setOp('gt'); setValue(''); setUnit('bpm'); setLevel('warning'); setRemark('')
    }
  }, [rule, open])

  function submit() {
    if (!name.trim()) return toast.error('请填写规则名称')
    if (!value) return toast.error('请填写阈值')
    const id = rule?.id || `R-NEW-${Date.now()}`
    const r: AlarmRule = {
      id, name: name.trim(), type, metric: RULE_TYPE_LABEL[type],
      op, value: Number(value), unit, level, enabled: true,
      remark: remark.trim() || '—', updatedAt: new Date().toISOString().slice(0, 10),
    }
    upsertRule(r)
    toast.success(isEdit ? '规则已更新' : '规则已新增')
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? '编辑告警规则' : '新增告警规则'}
      description="按「指标 + 操作符 + 阈值 + 级别」组合定义触发条件。"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}>{isEdit ? '保存' : '新增'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="rname">规则名称</Label>
        <Input id="rname" value={name} onChange={(e) => setName(e.target.value)} placeholder="如：心率过高" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>类型</Label>
          <Select value={type} onValueChange={(v) => setType(v as RuleType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(RULE_TYPE_LABEL) as RuleType[]).map((t) => (
                <SelectItem key={t} value={t}>{RULE_TYPE_LABEL[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>操作符</Label>
          <Select value={op} onValueChange={(v) => setOp(v as AlarmOperator)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lt">&lt; 小于</SelectItem>
              <SelectItem value="gt">&gt; 大于</SelectItem>
              <SelectItem value="lte">≤ 小于等于</SelectItem>
              <SelectItem value="gte">≥ 大于等于</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rval">阈值</Label>
          <Input id="rval" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="runit">单位</Label>
          <Input id="runit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="bpm / % / °C / 分钟 / 秒" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>级别</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as 'warning' | 'critical')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="warning">预警</SelectItem>
              <SelectItem value="critical">危急</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rremark">备注</Label>
          <Input id="rremark" value={remark} onChange={(e) => setRemark(e.target.value)} />
        </div>
      </div>
    </FormDialog>
  )
}
