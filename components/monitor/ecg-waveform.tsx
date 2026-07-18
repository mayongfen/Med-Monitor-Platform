'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// 纯 SVG 滚动 ECG 波形
export function EcgWaveform({
  history,
  color = 'var(--chart-1)',
  height = 120,
  className,
  speed = 1,
}: {
  history: number[]
  color?: string
  height?: number
  className?: string
  speed?: number
}) {
  const ref = useRef<SVGSVGElement>(null)
  const offsetRef = useRef(0)

  useEffect(() => {
    let raf: number
    function loop() {
      offsetRef.current -= speed
      if (ref.current) {
        ref.current.style.transform = `translateX(${offsetRef.current}px)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [speed])

  if (history.length < 2) {
    return <div className={cn('w-full rounded bg-muted/40', className)} style={{ height }} aria-hidden />
  }

  const w = 600
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const step = w / (history.length - 1)
  const path = history
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(height - ((p - min) / range) * (height - 8) - 4).toFixed(1)}`)
    .join(' ')

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height }}
      aria-hidden
    >
      {/* 网格 */}
      <defs>
        <pattern id="ecg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>
      <rect width={w} height={height} fill="url(#ecg-grid)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
