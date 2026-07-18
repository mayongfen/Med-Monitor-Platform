'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, BellRing, Volume2, VolumeX, X } from 'lucide-react'
import { useLiveMonitor, type LiveAlarm } from '@/hooks/use-live-monitor'
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

// 危急排前，其余按原序
function sortByPriority(list: LiveAlarm[]): LiveAlarm[] {
  const crit = list.filter((a) => a.level === 'critical')
  const warn = list.filter((a) => a.level !== 'critical')
  return [...crit, ...warn]
}

const DWELL: Record<'warning' | 'critical', number> = {
  critical: 5000,
  warning: 2500,
}

export function AlarmBanner() {
  const { pendingAlarms, criticalCount, acknowledge, acknowledgeAll } = useLiveMonitor()
  const [muted, setMuted] = useState(false)
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const lastIdRef = useRef<string | null>(null)

  const sorted = sortByPriority(pendingAlarms)
  const current = sorted[index % Math.max(1, sorted.length)]

  // 新危急告警触发声音
  useEffect(() => {
    if (muted || pendingAlarms.length === 0) return
    const latest = pendingAlarms[0]
    if (latest && latest.id !== lastIdRef.current) {
      lastIdRef.current = latest.id
      if (latest.level === 'critical') beep('critical')
    }
  }, [pendingAlarms, muted])

  // 告警数量变化时回到队首（危急优先）
  useEffect(() => {
    setIndex(0)
  }, [pendingAlarms.length])

  // 定时翻牌：按当前条级别决定停留，hover 暂停
  useEffect(() => {
    if (sorted.length <= 1 || hovered || !current) return
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % sorted.length)
    }, DWELL[current.level])
    return () => clearTimeout(t)
  }, [index, sorted.length, hovered, current?.level])

  if (pendingAlarms.length === 0 || !current) return null

  const isCritical = current.level === 'critical'

  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-1.5">
      {/* 待处理徽章 */}
      <span
        className={cn(
          'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
          criticalCount > 0 ? 'bg-destructive/15 text-destructive' : 'bg-chart-4/15 text-chart-4',
          criticalCount > 0 && 'animate-pulse',
        )}
      >
        <AlertTriangle className="size-3" />
        {pendingAlarms.length} 待处理{criticalCount > 0 && ` · ${criticalCount} 危急`}
      </span>

      {/* 单行翻牌区 */}
      <div
        className="relative min-w-0 flex-1 overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={`${current.ruleName} · ${current.patientName}（${current.wardName} ${current.bedId.split('-').slice(-1)[0]}床）· ${current.message}`}
      >
        <div className="flex h-5 items-center">
          <span
            key={current.id + '-' + index}
            className={cn(
              'animate-slide-up inline-flex items-center gap-1.5 truncate whitespace-nowrap text-xs',
              isCritical ? 'text-destructive' : 'text-chart-4',
            )}
          >
            <span className={cn('size-1.5 shrink-0 rounded-full', isCritical ? 'bg-destructive' : 'bg-chart-4', isCritical && 'animate-pulse')} />
            <span className="truncate">
              {current.ruleName} · {current.patientName}（{current.wardName} {current.bedId.split('-').slice(-1)[0]}床）· {current.message}
            </span>
          </span>
        </div>
        {/* 右侧渐隐 */}
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent" />
      </div>

      {/* 计数 */}
      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {index + 1}/{sorted.length}
      </span>

      {/* 静音 */}
      <button onClick={() => setMuted((m) => !m)} className="shrink-0 rounded p-1 hover:bg-muted" title="静音切换">
        {muted ? <VolumeX className="size-3.5 text-muted-foreground" /> : <Volume2 className="size-3.5 text-foreground" />}
      </button>
      {/* 确认当前 */}
      <button
        onClick={() => acknowledge(current.id)}
        className="shrink-0 rounded p-1 hover:bg-muted"
        title="确认当前告警"
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
