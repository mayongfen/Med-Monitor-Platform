'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, HeartPulse } from 'lucide-react'
import { NAV_GROUPS } from './nav-config'
import { useAuth } from '@/lib/auth'
import { canAccess } from '@/lib/permissions'
import { cn } from '@/lib/utils'

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname()
  const { role } = useAuth()
  // 默认展开「包含当前路由的组」+ 工作台；其余收起
  const initialOpen = new Set<string>()
  NAV_GROUPS.forEach((g) => {
    if (g.label === '工作台' || g.items.some((i) => pathname === i.href || pathname.startsWith(i.href + '/'))) {
      initialOpen.add(g.label)
    }
  })
  const [open, setOpen] = useState<Set<string>>(initialOpen)

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
        <span className="text-sm font-semibold text-sidebar-foreground">智联医护 · 控制台</span>
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
                    const active = pathname === item.href
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
