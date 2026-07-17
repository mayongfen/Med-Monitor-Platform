'use client'

import { useState } from 'react'
import { CheckCircle2, GitBranch, XCircle } from 'lucide-react'
import { TRACES, type Trace } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function TraceView() {
  const [activeId, setActiveId] = useState(TRACES[0]?.traceId ?? '')
  const active = TRACES.find((t) => t.traceId === activeId) ?? TRACES[0]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border border-border bg-card p-3">
        <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">调用链列表</h2>
        <ul className="flex flex-col gap-1">
          {TRACES.map((t) => (
            <li key={t.traceId}>
              <button
                onClick={() => setActiveId(t.traceId)}
                className={cn(
                  'w-full rounded-md border p-2.5 text-left transition-colors',
                  t.traceId === activeId
                    ? 'border-primary bg-accent/50'
                    : 'border-transparent hover:bg-muted',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-primary">{t.traceId}</span>
                  {t.status === 'ok' ? (
                    <CheckCircle2 className="size-3.5 text-chart-5" />
                  ) : (
                    <XCircle className="size-3.5 text-destructive" />
                  )}
                </div>
                <p className="mt-1 truncate text-xs font-medium text-foreground">{t.entry}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {t.actor} · {t.totalMs}ms
                </p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {active && <TraceDetail trace={active} />}
    </div>
  )
}

function TraceDetail({ trace }: { trace: Trace }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-primary" />
            <span className="font-mono text-sm text-foreground">{trace.traceId}</span>
            {trace.status === 'ok' ? (
              <Badge className="bg-chart-5/15 text-[10px] text-chart-5">成功</Badge>
            ) : (
              <Badge className="bg-destructive/15 text-[10px] text-destructive">失败</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {trace.entry} · {trace.actor} · {trace.time}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">总耗时</p>
          <p className="text-lg font-semibold text-foreground">{trace.totalMs}ms</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {trace.spans.map((span) => (
          <div key={span.id} className="flex items-center gap-2 text-sm">
            <div
              className="flex min-w-0 items-center gap-2"
              style={{ paddingLeft: `${span.depth * 18}px`, width: '46%' }}
            >
              <span
                className={cn(
                  'size-1.5 shrink-0 rounded-full',
                  span.status === 'ok' ? 'bg-chart-5' : 'bg-destructive',
                )}
              />
              <span className="truncate font-medium text-foreground">{span.service}</span>
            </div>

            <div className="relative h-6 flex-1 rounded bg-muted/60">
              <div
                className={cn(
                  'absolute top-0 flex h-6 items-center rounded px-2 text-[11px] text-white',
                  span.status === 'ok' ? 'bg-primary' : 'bg-destructive',
                )}
                style={{
                  left: `${(span.startOffsetMs / trace.totalMs) * 100}%`,
                  width: `${Math.max((span.durationMs / trace.totalMs) * 100, 6)}%`,
                }}
                title={`${span.operation} · ${span.durationMs}ms`}
              >
                <span className="truncate">{span.durationMs}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3">
        {trace.spans.map((span) => (
          <p key={span.id} className="text-xs text-muted-foreground" style={{ paddingLeft: `${span.depth * 18}px` }}>
            <span className="font-mono text-foreground">{span.service}</span> — {span.operation}
          </p>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        按 TraceId 贯穿 API 网关、鉴权、业务与审计服务，还原完整请求轨迹与耗时瀑布，快速定位失败节点。
      </p>
    </div>
  )
}
