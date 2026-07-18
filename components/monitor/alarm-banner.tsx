'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCheck, X, Volume2, VolumeX } from 'lucide-react'
import { useLiveMonitor } from '@/hooks/use-live-monitor'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 简易蜂鸣（Web Audio API，不依赖音频文件）
function beep(level: 'warning' | 'critical') {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = level === 'critical' ? 880 : 660
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (level === 'critical' ? 0.6 : 0.3))
    osc.start()
    osc.stop(ctx.currentTime + (level === 'critical' ? 0.6 : 0.3))
  } catch (e) {
    // 静默失败
  }
}

export function AlarmBanner() {
  const { pendingAlarms, criticalCount, acknowledge, acknowledgeAll } = useLiveMonitor()
  const [muted, setMuted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const lastIdRef = useRef<string | null>(null)

  // 新危急告警触发声音
  useEffect(() => {
    if (muted || pendingAlarms.length === 0) return
    const latest = pendingAlarms[0]
    if (latest.id !== lastIdRef.current) {
      lastIdRef.current = latest.id
      if (latest.level === 'critical') beep('critical')
    }
  }, [pendingAlarms, muted])

  if (pendingAlarms.length === 0) return null

  const top = pendingAlarms[0]
  const isCritical = criticalCount > 0

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-14 z-40 mx-auto flex max-w-4xl items-center gap-3 rounded-b-lg border px-4 py-2.5 shadow-lg',
        isCritical ? 'border-destructive/50 bg-destructive/10' : 'border-chart-4/50 bg-chart-4/10',
        isCritical && 'animate-pulse',
      )}
    >
      <AlertTriangle className={cn('size-5 shrink-0', isCritical ? 'text-destructive' : 'text-chart-4')} />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', isCritical ? 'text-destructive' : 'text-chart-4')}>
          {top.ruleName} · {top.message} · {top.patientName}（{top.wardName} {top.bedId.split('-').slice(-1)[0]}床）
        </p>
        <p className="text-xs text-muted-foreground">
          共 {pendingAlarms.length} 条未处理 · 危急 {criticalCount} 条 · {top.raisedAt}
        </p>
      </div>
      <button onClick={() => setMuted((m) => !m)} className="rounded p-1 hover:bg-muted">
        {muted ? <VolumeX className="size-4 text-muted-foreground" /> : <Volume2 className="size-4 text-foreground" />}
      </button>
      <Button size="sm" variant="outline" onClick={() => setExpanded((e) => !e)}>
        {expanded ? '收起' : '详情'}
      </Button>
      <Button size="sm" variant="outline" onClick={() => acknowledge(top.id)}>
        <X className="size-3.5" /> 确认当前
      </Button>
      <Button size="sm" variant="default" onClick={acknowledgeAll}>
        <CheckCheck className="size-3.5" /> 全部确认
      </Button>

      {expanded && (
        <div className="absolute inset-x-0 top-full max-h-64 overflow-y-auto rounded-b-lg border border-border bg-card shadow-lg">
          {pendingAlarms.slice(0, 20).map((a) => (
            <div key={a.id} className="flex items-center gap-3 border-b border-border/50 px-4 py-2 last:border-0">
              <span className={cn('size-2 rounded-full', a.level === 'critical' ? 'bg-destructive' : 'bg-chart-4')} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{a.ruleName} · {a.message}</p>
                <p className="text-xs text-muted-foreground">{a.patientName} · {a.wardName} {a.bedId.split('-').slice(-1)[0]}床 · {a.raisedAt}</p>
              </div>
              <button onClick={() => acknowledge(a.id)} className="text-xs text-primary hover:underline">确认</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
