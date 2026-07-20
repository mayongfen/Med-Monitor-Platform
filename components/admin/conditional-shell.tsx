'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'
import { ConsoleShell } from './console-shell'

// 独立全屏页面（不套控制台外壳）：登录页 + 实时监护大屏
const STANDALONE_ROUTES = new Set(['/login', '/dashboard'])

/**
 * 根据当前路由决定是否套控制台外壳。
 * - /login、/dashboard：独立全屏布局，原样渲染
 * - 其余路由：套 ConsoleShell（侧栏 + 顶栏 + 内容区）
 */
export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (STANDALONE_ROUTES.has(pathname)) return <>{children}</>
  return <ConsoleShell>{children}</ConsoleShell>
}
