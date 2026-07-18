'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { NAV_GROUPS } from '@/components/admin/nav-config'
import { useAuth } from '@/lib/auth'
import { canAccess } from '@/lib/permissions'
import { cn } from '@/lib/utils'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const router = useRouter()
  const { role } = useAuth()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const items = NAV_GROUPS.flatMap((g) =>
    g.items
      .filter((i) => canAccess(i.href, role))
      .map((i) => ({ ...i, group: g.label })),
  ).filter((i) => {
    if (!q) return true
    const kw = q.toLowerCase()
    return i.title.toLowerCase().includes(kw) || i.group.toLowerCase().includes(kw) || i.href.includes(kw)
  })

  function go(href: string) {
    router.push(href)
    setOpen(false)
    setQ('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh]" onClick={() => setOpen(false)}>
      <div
        className="mx-4 w-full max-w-xl rounded-xl border border-border bg-popover p-0 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索功能菜单…（如：告警、床位、用户）"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-muted">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">未找到匹配的功能</p>
          ) : (
            items.map((i) => (
              <button
                key={i.href}
                onClick={() => go(i.href)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <i.icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-foreground">{i.title}</span>
                <span className="text-xs text-muted-foreground">{i.group}</span>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <kbd className="rounded border border-border px-1">Esc</kbd> 关闭 · <kbd className="rounded border border-border px-1">⌘K</kbd> 唤起
        </div>
      </div>
    </div>
  )
}
