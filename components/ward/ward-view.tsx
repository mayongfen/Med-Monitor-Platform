'use client'

import Link from 'next/link'
import { Plus, Download, Building2 } from 'lucide-react'
import {
  WARDS,
  BEDS,
  WARD_TYPE_LABEL,
  WARD_STATUS_LABEL,
  type WardStatus,
} from '@/lib/ward-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function WardView() {
  const totalBeds = BEDS.length
  const occupied = BEDS.filter((b) => b.status === 'occupied').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="病区总数" value={WARDS.length} accent="text-primary" />
        <Stat label="床位总数" value={totalBeds} accent="text-chart-1" />
        <Stat label="在用床位" value={occupied} accent="text-chart-5" />
        <Stat label="使用率" value={`${Math.round((occupied / totalBeds) * 100)}%`} accent="text-chart-4" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="size-4 text-primary" /> 病区列表
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Download className="size-4" /> 导出
            </Button>
            <Button size="sm">
              <Plus className="size-4" /> 新增病区
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">病区编码</th>
                <th className="px-3 py-2 font-medium">病区名称</th>
                <th className="px-3 py-2 font-medium">位置</th>
                <th className="px-3 py-2 font-medium">科别</th>
                <th className="px-3 py-2 font-medium">类型</th>
                <th className="px-3 py-2 font-medium">床位数</th>
                <th className="px-3 py-2 font-medium">状态</th>
                <th className="px-3 py-2 font-medium">创建时间</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {WARDS.map((w) => {
                const beds = BEDS.filter((b) => b.wardId === w.id).length
                return (
                  <tr key={w.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{w.id}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{w.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{w.location}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{w.dept}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="secondary" className="text-[10px]">{WARD_TYPE_LABEL[w.type]}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {beds} / {w.bedCount}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px]',
                          w.status === 'open' ? 'bg-chart-5/10 text-chart-5' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {WARD_STATUS_LABEL[w.status as WardStatus]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{w.createdAt}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2 text-xs">
                        <button className="text-primary hover:underline">编辑</button>
                        <span className="text-border">|</span>
                        <Link href="/ward/beds" className="text-primary hover:underline">床位</Link>
                        <span className="text-border">|</span>
                        <button className="text-destructive hover:underline">删除</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          病区类型支持重症监护室 / 普通病房 / 隔离病房 / 手术室；床位数量范围 1-100，必填项为名称、科别、床位数量。
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold tabular-nums', accent)}>{value}</p>
    </div>
  )
}
