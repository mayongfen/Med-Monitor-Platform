'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'
import { ConsoleShell } from './console-shell'
import { normalizePathname } from '@/lib/utils'

// 独立全屏页面（不套控制台外壳）：登录页 + 实时监护大屏
const STANDALONE_ROUTES = new Set(['/login', '/dashboard'])

/**
 * 根据当前路由决定是否套控制台外壳。
 * - /login、/dashboard：独立全屏布局，原样渲染
 * - 其余路由：套 ConsoleShell（侧栏 + 顶栏 + 内容区）
 */
export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // trailingSlash:true 时 pathname 带尾斜杠（/login/），需归一化后再比较，
  // 否则登录页/大屏会被误套控制台外壳
  if (STANDALONE_ROUTES.has(normalizePathname(pathname))) return <>{children}</>
  return <ConsoleShell>{children}</ConsoleShell>
}
