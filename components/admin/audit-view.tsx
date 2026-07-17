'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Search, XCircle } from 'lucide-react'
import { AUDIT_LOGS, AUDIT_CATEGORY_LABEL, type AuditLog } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const CATEGORY_STYLE: Record<AuditLog['category'], string> = {
  login: 'bg-primary/15 text-primary',
  operation: 'bg-chart-3/15 text-chart-3',
  data: 'bg-chart-4/15 text-chart-4',
  permission: 'bg-chart-5/15 text-chart-5',
  security: 'bg-destructive/15 text-destructive',
  system: 'bg-muted text-muted-foreground',
}

const CATEGORIES = ['all', ...Object.keys(AUDIT_CATEGORY_LABEL)] as const

export function AuditView() {
  const [category, setCategory] = useState<string>('all')
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return AUDIT_LOGS.filter((log) => {
      if (category !== 'all' && log.category !== category) return false
      if (!kw) return true
      return (
        log.actor.toLowerCase().includes(kw) ||
        log.action.toLowerCase().includes(kw) ||
        log.target.toLowerCase().includes(kw) ||
        log.traceId.toLowerCase().includes(kw)
      )
    })
  }, [category, keyword])

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索操作人 / 动作 / 对象 / TraceId"
            className="pl-8"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              category === c
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted',
            )}
          >
            {c === 'all' ? '全部' : AUDIT_CATEGORY_LABEL[c as AuditLog['category']]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">时间</th>
              <th className="px-3 py-2 font-medium">类别</th>
              <th className="px-3 py-2 font-medium">操作人</th>
              <th className="px-3 py-2 font-medium">动作</th>
              <th className="px-3 py-2 font-medium">对象</th>
              <th className="px-3 py-2 font-medium">IP</th>
              <th className="px-3 py-2 font-medium">TraceId</th>
              <th className="px-3 py-2 font-medium">结果</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{log.time}</td>
                <td className="px-3 py-2.5">
                  <Badge className={cn('text-[10px]', CATEGORY_STYLE[log.category])}>
                    {AUDIT_CATEGORY_LABEL[log.category]}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 font-medium text-foreground">{log.actor}</td>
                <td className="px-3 py-2.5 text-foreground">{log.action}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{log.target}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{log.ip}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-primary">{log.traceId}</td>
                <td className="px-3 py-2.5">
                  {log.result === 'success' ? (
                    <CheckCircle2 className="size-4 text-chart-5" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  未匹配到日志
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        六类日志独立落库并自动脱敏，支持按类别、关键字与 TraceId 检索；点击 TraceId 可在链路追踪中还原完整请求轨迹。
      </p>
    </div>
  )
}
