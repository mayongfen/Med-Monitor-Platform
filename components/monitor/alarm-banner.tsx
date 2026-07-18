'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, BellRing, Volume2, VolumeX, X } from 'lucide-react'
import { useLiveMonitor } from '@/hooks/use-live-monitor'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  const lastIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (muted || pendingAlarms.length === 0) return
    const latest = pendingAlarms[0]
    if (latest && latest.id !== lastIdRef.current) {
      lastIdRef.current = latest.id
      if (latest.level === 'critical') beep('critical')
    }
  }, [pendingAlarms, muted])

  if (pendingAlarms.length === 0) return null

  const isCritical = criticalCount > 0
  // 拼接告警文本（双份用于无缝滚动）
  const items = pendingAlarms.slice(0, 12)
  const text = items
    .map((a) => `${a.ruleName} · ${a.patientName}（${a.wardName} ${a.bedId.split('-').slice(-1)[0]}床）· ${a.message}`)
    .join('　　|　　')
  const full = text + '　　|　　' + text

  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-1.5">
      {/* 状态图标 */}
      <span
        className={cn(
          'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
          isCritical ? 'bg-destructive/15 text-destructive' : 'bg-chart-4/15 text-chart-4',
          isCritical && 'animate-pulse',
        )}
      >
        <AlertTriangle className="size-3" />
        {pendingAlarms.length} 待处理
        {isCritical && <span className="ml-0.5">·{criticalCount}危急</span>}
      </span>

      {/* 滚动文本区 */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max flex-nowrap items-center gap-8 whitespace-nowrap">
          {items.concat(items).map((a, i) => (
            <span
              key={a.id + '-' + i}
              className={cn(
                'inline-flex items-center gap-1.5 text-xs',
                a.level === 'critical' ? 'text-destructive' : 'text-chart-4',
              )}
            >
              <span className={cn('size-1.5 rounded-full', a.level === 'critical' ? 'bg-destructive' : 'bg-chart-4')} />
              {a.ruleName} · {a.patientName}（{a.wardName} {a.bedId.split('-').slice(-1)[0]}床）· {a.message}
            </span>
          ))}
        </div>
        {/* 渐隐遮罩 */}
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent" />
      </div>

      {/* 静音 */}
      <button onClick={() => setMuted((m) => !m)} className="shrink-0 rounded p-1 hover:bg-muted">
        {muted ? <VolumeX className="size-3.5 text-muted-foreground" /> : <Volume2 className="size-3.5 text-foreground" />}
      </button>
      {/* 确认当前 */}
      <button
        onClick={() => acknowledge(pendingAlarms[0].id)}
        className="shrink-0 rounded p-1 hover:bg-muted"
        title="确认最新一条"
      >
        <X className="size-3.5 text-muted-foreground" />
      </button>
      {/* 全部确认 */}
      <Button size="sm" variant="ghost" className="shrink-0 gap-1 px-2 text-xs" onClick={acknowledgeAll}>
        <BellRing className="size-3.5" /> 全部确认
      </Button>
    </div>
  )
}
