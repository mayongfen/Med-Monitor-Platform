'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, HeartPulse } from 'lucide-react'
import { NAV_GROUPS } from './nav-config'
import { useAuth } from '@/lib/auth'
import { canAccess } from '@/lib/permissions'
import { cn, normalizePathname } from '@/lib/utils'

// 跨路由保持侧栏分组展开状态（同一浏览器会话内有效，不做 localStorage 持久化 —— 方案 A）
// 仅在客户端 effect 中写入，避免 SSR 跨请求污染
let persistedOpenGroups: Set<string> | null = null

// 计算应自动展开的分组：工作台 + 包含当前路由的组
function computeAutoOpen(pathname: string): Set<string> {
  const set = new Set<string>()
  NAV_GROUPS.forEach((g) => {
    if (g.label === '工作台' || g.items.some((i) => pathname === i.href || pathname.startsWith(i.href + '/'))) {
      set.add(g.label)
    }
  })
  return set
}

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname()
  const { role } = useAuth()
  // 初始展开集 = 已持久化的手动展开 ∪ (当前路由所在组 + 工作台)
  // 用户手动展开的分组在跨路由后不会丢失，同时保留「当前所在组自动展开」的导航提示
  const [open, setOpen] = useState<Set<string>>(
    () => new Set([...(persistedOpenGroups ?? []), ...computeAutoOpen(pathname)]),
  )

  // 路由变化时自动展开当前所在组（导航提示），但绝不自动收起用户已展开的分组
  useEffect(() => {
    setOpen((prev) => {
      const next = new Set(prev)
      let changed = false
      computeAutoOpen(pathname).forEach((g) => {
        if (!next.has(g)) { next.add(g); changed = true }
      })
      return changed ? next : prev
    })
  }, [pathname])

  // 持久化到模块级（仅在客户端 effect 写入，SSR 安全无跨请求污染）
  useEffect(() => {
    persistedOpenGroups = open
  }, [open])

  function toggle(label: string) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <Link href="/" onClick={onNavigate} className="flex h-14 items-center gap-2 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HeartPulse className="size-4" />
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">某某医护平台 · 控制台</span>
      </Link>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-3">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((i) => canAccess(i.href, role))
          if (items.length === 0) return null
          const isOpen = open.has(group.label)
          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggle(group.label)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-sidebar-accent"
              >
                <span>{group.label}</span>
                <ChevronDown className={cn('size-3.5 transition-transform', !isOpen && '-rotate-90')} />
              </button>
              {isOpen && (
                <ul className="mb-2 mt-0.5 flex flex-col gap-0.5">
                  {items.map((item) => {
                    // trailingSlash:true 时 pathname 带尾斜杠（/admin/users/），需与 item.href 归一化后比较
                    const active = normalizePathname(pathname) === normalizePathname(item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                            active
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
                          {item.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-2 text-[10px] text-muted-foreground">
        当前角色：{role}
      </div>
    </aside>
  )
}
