'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

// 内容区路由过渡：pathname 变化时通过 key 触发重挂载，播放淡入动画。
// 外壳（侧栏 / 顶栏）已在 layout 挂载且不参与过渡，仅内容区有过渡效果。
// 依赖 tw-animate-css 提供的 animate-in / fade-in-0 工具类。
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div
      key={pathname}
      className="animate-in fade-in-0"
      style={{ animationDuration: '300ms' }}
    >
      {children}
    </div>
  )
}
