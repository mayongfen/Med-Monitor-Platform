'use client'

import { useState } from 'react'
import { Plus, Download, Search, User } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportCSV } from '@/lib/export'
import { cn } from '@/lib/utils'
import { CONTACT_RELATION_LABEL, formatContacts, primaryContact, type Patient } from '@/lib/patient-data'
import { PatientDialog } from './patient-dialog'

export function PatientView() {
  const { patients } = useStore()
  const [q, setQ] = useState('')
  const [hasAllergy, setHasAllergy] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const list = patients.filter((p) => {
    if (q) {
      const kw = q.trim().toLowerCase()
      if (!p.name.toLowerCase().includes(kw) && !p.id.toLowerCase().includes(kw) && !p.idCard.includes(kw)) return false
    }
    if (hasAllergy && !p.allergy) return false
    return true
  })

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="size-4 text-primary" /> 住院档案
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => {
            const rows = patients.map((p) => [p.id, p.name, p.gender, p.age, p.idCard, p.contacts.length, formatContacts(p), p.allergy ?? '', p.history ?? ''])
            exportCSV(['患者ID','姓名','性别','年龄','身份证','联系人数','联系人明细','过敏史','病史'], rows, '住院档案')
          }}>
            <Download className="size-4" /> 导出
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> 新增档案
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="按姓名 / 患者 ID / 身份证搜索"
            className="w-64 pl-8"
          />
        </div>
        <button
          onClick={() => setHasAllergy((v) => !v)}
          className={cn(
            'rounded-full border px-2.5 py-1 text-xs transition-colors',
            hasAllergy ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-border text-muted-foreground',
          )}
        >
          仅看过敏史
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">患者 ID</th>
              <th className="px-3 py-2 font-medium">姓名</th>
              <th className="px-3 py-2 font-medium">性别</th>
              <th className="px-3 py-2 font-medium">年龄</th>
              <th className="px-3 py-2 font-medium">身份证号</th>
              <th className="px-3 py-2 font-medium">紧急联系人</th>
              <th className="px-3 py-2 font-medium">过敏史</th>
              <th className="px-3 py-2 font-medium">病史</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.id}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{p.name}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{p.gender}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{p.age}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.idCard}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  <ContactCell patient={p} />
                </td>
                <td className="px-3 py-2.5">
                  {p.allergy ? (
                    <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive">{p.allergy}</Badge>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{p.history ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-2 text-xs">
                    <button className="text-primary hover:underline">编辑</button>
                    <span className="text-border">|</span>
                    <button className="text-primary hover:underline">入院</button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  未找到匹配的患者
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        支持姓名拼音首字母查询；身份证号支持 OCR 识别录入，年龄由身份证自动计算。
      </p>

      <PatientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

function ContactCell({ patient }: { patient: Patient }) {
  const c = primaryContact(patient)
  if (!c) return <span className="text-muted-foreground/50">—</span>
  const extra = patient.contacts.length - 1
  const rel = c.relation ? CONTACT_RELATION_LABEL[c.relation] : ''
  return (
    <div className="flex flex-col gap-0.5">
      <span className="whitespace-nowrap">
        {c.name}
        {rel && <span className="ml-1 text-xs text-muted-foreground">（{rel}）</span>}
      </span>
      <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
        {c.phone}
        {extra > 0 && <Badge variant="secondary" className="text-[10px]">+{extra}</Badge>}
      </span>
    </div>
  )
}
