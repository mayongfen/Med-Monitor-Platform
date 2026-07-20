'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScanLine, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { CONTACT_RELATION_LABEL, type Contact } from '@/lib/patient-data'
import { DictSelect, dictOptions } from '@/components/ui/dict-select'

const MAX_CONTACTS = 5

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
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', phone: '', relation: 'child' },
  ])
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

  function updateContact(idx: number, patch: Partial<Contact>) {
    setContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  }

  function addContact() {
    if (contacts.length >= MAX_CONTACTS) {
      toast.warning(`最多添加 ${MAX_CONTACTS} 位联系人`)
      return
    }
    setContacts((prev) => [...prev, { name: '', phone: '', relation: 'child' }])
  }

  function removeContact(idx: number) {
    setContacts((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)))
  }

  function reset() {
    setName('')
    setAge('')
    setIdCard('')
    setContacts([{ name: '', phone: '', relation: 'child' }])
    setAllergy('')
    setHistory('')
  }

  function submit() {
    if (!name.trim()) return toast.error('请填写姓名')
    if (!age.trim()) return toast.error('请填写年龄')
    if (!idCard.trim()) return toast.error('请填写身份证号')
    const valid = contacts.filter((c) => c.name.trim())
    if (valid.length === 0) return toast.error('请至少填写一位紧急联系人')
    addPatient({
      name: name.trim(),
      gender,
      age: Number(age),
      idCard: idCard.trim(),
      contacts: valid.map((c) => ({
        name: c.name.trim(),
        phone: c.phone.trim() || '—',
        relation: c.relation,
      })),
      allergy: allergy.trim() || undefined,
      history: history.trim() || undefined,
    })
    toast.success('档案已建立')
    onOpenChange(false)
    reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="新增住院档案"
      description="支持 OCR 识别身份证自动填充（演示为模拟）；紧急联系人可添加多位。"
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
          <DictSelect
            value={gender}
            onValueChange={setGender}
            options={[{ value: '男', label: '男' }, { value: '女', label: '女' }]}
          />
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
          <Label htmlFor="allergy">过敏史</Label>
          <Input id="allergy" value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="如：青霉素" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hist">病史</Label>
          <Input id="hist" value={history} onChange={(e) => setHistory(e.target.value)} placeholder="如：高血压" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>紧急联系人（可添加多位）</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addContact}
            disabled={contacts.length >= MAX_CONTACTS}
          >
            <Plus className="size-4" /> 添加联系人
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {contacts.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-[6rem_1fr_1fr_auto] items-center gap-2"
            >
              <DictSelect
                value={c.relation ?? 'other'}
                onValueChange={(v) => updateContact(i, { relation: v })}
                options={dictOptions(CONTACT_RELATION_LABEL)}
                className="w-full"
              />
              <Input
                value={c.name}
                onChange={(e) => updateContact(i, { name: e.target.value })}
                placeholder="联系人姓名"
              />
              <Input
                value={c.phone}
                onChange={(e) => updateContact(i, { phone: e.target.value })}
                placeholder="联系电话"
                inputMode="tel"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeContact(i)}
                disabled={contacts.length <= 1}
                aria-label="删除联系人"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          最多添加 {MAX_CONTACTS} 位联系人，至少填写一位联系人姓名。
        </p>
      </div>
    </FormDialog>
  )
}
