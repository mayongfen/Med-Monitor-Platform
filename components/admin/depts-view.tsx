'use client'

import { useState } from 'react'
import { Building, ChevronDown, ChevronRight, Plus, UserCircle } from 'lucide-react'
import { DEPTS, type Dept } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function buildTree(depts: Dept[], parentId: number | null): (Dept & { children: Dept[] })[] {
  return depts
    .filter((d) => d.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((d) => ({ ...d, children: buildTree(depts, d.id) as Dept[] }))
}

const SCOPE_LABEL: Record<Dept['scope'], string> = {
  self: '本人',
  dept: '本部门',
  tenant: '本租户',
}

export function DeptsView() {
  const tree = buildTree(DEPTS, null)
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">组织架构</h2>
        <Button size="sm" variant="outline">
          <Plus className="size-4" /> 新增部门
        </Button>
      </div>
      <DeptTree nodes={tree} depth={0} />
      <p className="mt-4 text-xs text-muted-foreground">
        部门绑定数据范围，用于 RBAC 数据权限的落点计算。
      </p>
    </div>
  )
}

function DeptTree({ nodes, depth }: { nodes: (Dept & { children: Dept[] })[]; depth: number }) {
  return (
    <ul className="flex flex-col gap-1">
      {nodes.map((node) => (
        <DeptNode key={node.id} node={node} depth={depth} />
      ))}
    </ul>
  )
}

function DeptNode({ node, depth }: { node: Dept & { children: Dept[] }; depth: number }) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children.length > 0
  return (
    <li>
      <div
        style={{ paddingLeft: `${depth * 22 + 8}px` }}
        className="flex items-center gap-2 rounded-md py-2 pr-3 hover:bg-muted"
      >
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
        <Building className="size-4 shrink-0 text-primary" />
        <span className="text-sm font-medium text-foreground">{node.name}</span>
        <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <UserCircle className="size-3" /> {node.leader}
        </span>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {SCOPE_LABEL[node.scope]}
        </Badge>
      </div>
      {hasChildren && open && (
        <DeptTree nodes={node.children as (Dept & { children: Dept[] })[]} depth={depth + 1} />
      )}
    </li>
  )
}
