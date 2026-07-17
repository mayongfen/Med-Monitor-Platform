'use client'

import { useState } from 'react'
import { ChevronRight, Lock, Plus, Users2 } from 'lucide-react'
import { ROLES, DATA_SCOPE_LABEL, type Role } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 构建角色层级树（闭包表的可视化）
function buildTree(roles: Role[], parentId: number | null): (Role & { children: Role[] })[] {
  return roles
    .filter((r) => r.parentId === parentId)
    .map((r) => ({ ...r, children: buildTree(roles, r.id) as Role[] }))
}

export function RolesView() {
  const [selected, setSelected] = useState<Role>(ROLES[2])
  const tree = buildTree(ROLES, null)

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">角色层级（闭包表继承）</h2>
          <Button size="sm" variant="outline">
            <Plus className="size-4" /> 新增角色
          </Button>
        </div>
        <RoleTree nodes={tree} depth={0} selected={selected} onSelect={setSelected} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">{selected.name}</h2>
          {selected.builtin && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Lock className="size-3" /> 内置
            </Badge>
          )}
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{selected.code}</p>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">{selected.desc}</p>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">数据范围</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {DATA_SCOPE_LABEL[selected.dataScope]}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">继承自</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {ROLES.find((r) => r.id === selected.parentId)?.name ?? '顶级角色'}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">权限数</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {selected.permissions === 999 ? '*:*:* 通配' : selected.permissions}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users2 className="size-3" /> 成员
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{selected.members} 人</dd>
          </div>
        </dl>

        <div className="mt-5 flex gap-2">
          <Button size="sm" className="flex-1">
            分配权限
          </Button>
          <Button size="sm" variant="outline" className="flex-1" disabled={selected.builtin}>
            编辑
          </Button>
        </div>
      </div>
    </div>
  )
}

function RoleTree({
  nodes,
  depth,
  selected,
  onSelect,
}: {
  nodes: (Role & { children: Role[] })[]
  depth: number
  selected: Role
  onSelect: (r: Role) => void
}) {
  return (
    <ul className="flex flex-col gap-1">
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            onClick={() => onSelect(node)}
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md py-2 pr-3 text-left text-sm transition-colors',
              selected.id === node.id
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted',
            )}
          >
            {node.children.length > 0 ? (
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <span className="size-3.5 shrink-0" />
            )}
            <span className="font-medium">{node.name}</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {DATA_SCOPE_LABEL[node.dataScope]}
            </Badge>
            <span className="text-xs text-muted-foreground">{node.members}人</span>
          </button>
          {node.children.length > 0 && (
            <RoleTree
              nodes={node.children as (Role & { children: Role[] })[]}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
            />
          )}
        </li>
      ))}
    </ul>
  )
}
