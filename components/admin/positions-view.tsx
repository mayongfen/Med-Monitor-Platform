'use client'

import { Plus, Briefcase, Download } from 'lucide-react'
import { POSITIONS, POSITION_STATUS_LABEL, type PositionStatus } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PositionsView() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Briefcase className="size-4 text-primary" /> 岗位列表
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="size-4" /> 导出
          </Button>
          <Button size="sm">
            <Plus className="size-4" /> 新增岗位
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">编号</th>
              <th className="px-3 py-2 font-medium">岗位名称</th>
              <th className="px-3 py-2 font-medium">岗位编码</th>
              <th className="px-3 py-2 font-medium">顺序</th>
              <th className="px-3 py-2 font-medium">备注</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">创建时间</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {POSITIONS.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{String(p.id).padStart(3, '0')}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{p.name}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.code}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{p.order}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{p.remark}</td>
                <td className="px-3 py-2.5">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px]',
                      p.status === 'open' ? 'bg-chart-5/10 text-chart-5' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {POSITION_STATUS_LABEL[p.status as PositionStatus]}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{p.createdAt}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-2 text-xs">
                    <button className="text-primary hover:underline">编辑</button>
                    <span className="text-border">|</span>
                    <button className="text-destructive hover:underline">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        岗位用于明确人员职责，支持开启 / 关闭状态管理与排序。
      </p>
    </div>
  )
}
