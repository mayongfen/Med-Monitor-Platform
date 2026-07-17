'use client'

import { useState } from 'react'
import { Plus, Download, Search, User } from 'lucide-react'
import { PATIENTS } from '@/lib/patient-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function PatientView() {
  const [q, setQ] = useState('')
  const [hasAllergy, setHasAllergy] = useState(false)

  const list = PATIENTS.filter((p) => {
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
          <User className="size-4 text-primary" /> 患者档案
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="size-4" /> 导出
          </Button>
          <Button size="sm">
            <Plus className="size-4" /> 新增患者
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
              <th className="px-3 py-2 font-medium">电话</th>
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
                <td className="px-3 py-2.5 text-muted-foreground">{p.contact}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.phone}</td>
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
                <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
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
    </div>
  )
}
