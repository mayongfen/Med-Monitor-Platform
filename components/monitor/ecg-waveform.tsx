'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

// 纯 SVG 心率波形预览：根据 history 数据静态绘制趋势线。
// 每个实例拥有独立的 pattern id，避免多实例 id 冲突导致网格串扰。
export function EcgWaveform({
  history,
  color = 'var(--chart-1)',
  height = 120,
  className,
}: {
  history: number[]
  color?: string
  height?: number
  className?: string
  /** 保留兼容旧调用，预览模式不再使用滚动动画 */
  speed?: number
}) {
  // useId 返回值含冒号（如 ":r0:"），在 SVG url(#...) 引用中非法，需清洗
  const rawId = useId()
  const patternId = `ecg-grid-${rawId.replace(/[:]/g, '')}`

  if (history.length < 2) {
    return <div className={cn('w-full rounded bg-muted/40', className)} style={{ height }} aria-hidden />
  }

  const w = 600
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const step = w / (history.length - 1)
  const path = history
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(
          height -
          ((p - min) / range) * (height - 8) -
          4
        ).toFixed(1)}`,
    )
    .join(' ')

  return (
    <div className={cn('overflow-hidden rounded', className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden
      >
        {/* 网格背景 —— 每个实例独立 id，避免多卡片间 pattern 串扰 */}
        <defs>
          <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width={w} height={height} fill={`url(#${patternId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
