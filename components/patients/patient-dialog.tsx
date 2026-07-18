'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScanLine } from 'lucide-react'
import { toast } from 'sonner'

export function PatientDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { addPatient } = useStore()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'男' | '女'>('男')
  const [age, setAge] = useState('')
  const [idCard, setIdCard] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [allergy, setAllergy] = useState('')
  const [history, setHistory] = useState('')

  function ocr() {
    toast.success('OCR 识别成功（模拟）')
    const names = ['张伟', '李秀英', '王强', '刘敏', '陈杰']
    setName(names[Math.floor(Math.random() * names.length)])
    setGender(Math.random() > 0.5 ? '男' : '女')
    setAge(String(35 + Math.floor(Math.random() * 40)))
    setIdCard('3101**********' + String(Math.floor(Math.random() * 9000) + 1000))
  }

  function submit() {
    if (!name.trim()) return toast.error('请填写姓名')
    if (!age.trim()) return toast.error('请填写年龄')
    if (!idCard.trim()) return toast.error('请填写身份证号')
    addPatient({
      name: name.trim(),
      gender,
      age: Number(age),
      idCard: idCard.trim(),
      contact: contact || '—',
      phone: phone || '—',
      allergy: allergy.trim() || undefined,
      history: history.trim() || undefined,
    })
    toast.success('档案已建立')
    onOpenChange(false)
    setName(''); setAge(''); setIdCard(''); setContact(''); setPhone(''); setAllergy(''); setHistory('')
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="新增住院档案"
      description="支持 OCR 识别身份证自动填充（演示为模拟）。"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}>保存档案</Button>
        </>
      }
    >
      <div className="flex items-center justify-between">
        <Label>身份证 OCR</Label>
        <Button size="sm" variant="outline" onClick={ocr}>
          <ScanLine className="size-4" /> 识别身份证
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">姓名</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>性别</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as '男' | '女')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="男">男</SelectItem>
              <SelectItem value="女">女</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="age">年龄</Label>
          <Input id="age" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} inputMode="numeric" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="idcard">身份证号</Label>
          <Input id="idcard" value={idCard} onChange={(e) => setIdCard(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact">紧急联系人</Label>
          <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">联系电话</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="allergy">过敏史</Label>
          <Input id="allergy" value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="如：青霉素" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hist">病史</Label>
          <Input id="hist" value={history} onChange={(e) => setHistory(e.target.value)} placeholder="如：高血压" />
        </div>
      </div>
    </FormDialog>
  )
}
