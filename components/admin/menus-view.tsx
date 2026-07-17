'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Eye, EyeOff, Folder, Link2, MousePointerClick, Plus } from 'lucide-react'
import { MENUS, type MenuItem } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function buildTree(menus: MenuItem[], parentId: number | null): (MenuItem & { children: MenuItem[] })[] {
  return menus
    .filter((m) => m.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((m) => ({ ...m, children: buildTree(menus, m.id) as MenuItem[] }))
}

const TYPE_META: Record<MenuItem['type'], { label: string; icon: typeof Folder; cls: string }> = {
  catalog: { label: '目录', icon: Folder, cls: 'text-chart-4' },
  menu: { label: '菜单', icon: Link2, cls: 'text-primary' },
  button: { label: '按钮', icon: MousePointerClick, cls: 'text-chart-5' },
}

export function MenusView() {
  const tree = buildTree(MENUS, null)
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">菜单与权限码</h2>
        <Button size="sm" variant="outline">
          <Plus className="size-4" /> 新增菜单
        </Button>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 border-b border-border px-2 pb-2 text-xs font-medium text-muted-foreground">
        <span>名称</span>
        <span className="w-32 text-left">权限码</span>
        <span className="w-16 text-center">类型</span>
        <span className="w-14 text-center">显示</span>
      </div>
      <MenuTree nodes={tree} depth={0} />
      <p className="mt-4 text-xs text-muted-foreground">
        权限码遵循 <code className="rounded bg-muted px-1">resource:action:scope</code> 规范，超级管理员通配{' '}
        <code className="rounded bg-muted px-1">*:*:*</code>。
      </p>
    </div>
  )
}

function MenuTree({ nodes, depth }: { nodes: (MenuItem & { children: MenuItem[] })[]; depth: number }) {
  return (
    <ul>
      {nodes.map((node) => (
        <MenuNode key={node.id} node={node} depth={depth} />
      ))}
    </ul>
  )
}

function MenuNode({ node, depth }: { node: MenuItem & { children: MenuItem[] }; depth: number }) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children.length > 0
  const meta = TYPE_META[node.type]
  return (
    <li>
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
          <button
            onClick={() => hasChildren && setOpen((o) => !o)}
            className={cn('flex size-4 items-center justify-center', !hasChildren && 'invisible')}
          >
            {open ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
          </button>
          <meta.icon className={cn('size-4 shrink-0', meta.cls)} />
          <span className="text-sm text-foreground">{node.name}</span>
          {node.path && <span className="text-xs text-muted-foreground">{node.path}</span>}
        </div>
        <span className="w-32 truncate text-left font-mono text-xs text-muted-foreground">
          {node.perm ?? '—'}
        </span>
        <span className="w-16 text-center">
          <Badge variant="secondary" className="text-[10px]">
            {meta.label}
          </Badge>
        </span>
        <span className="flex w-14 justify-center">
          {node.visible ? (
            <Eye className="size-4 text-chart-5" />
          ) : (
            <EyeOff className="size-4 text-muted-foreground" />
          )}
        </span>
      </div>
      {hasChildren && open && (
        <MenuTree nodes={node.children as (MenuItem & { children: MenuItem[] })[]} depth={depth + 1} />
      )}
    </li>
  )
}
