'use client'

import { useState } from 'react'
import { KeyRound, Plus, Search, ShieldCheck, ShieldOff } from 'lucide-react'
import { USERS, ROLES, deptName, tenantName, type User } from '@/lib/admin-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const STATUS: Record<User['status'], { label: string; cls: string }> = {
  active: { label: '正常', cls: 'bg-chart-5/15 text-chart-5' },
  disabled: { label: '已禁用', cls: 'bg-muted text-muted-foreground' },
  locked: { label: '已锁定', cls: 'bg-destructive/15 text-destructive' },
}

function roleName(code: string) {
  return ROLES.find((r) => r.code === code)?.name ?? code
}

export function UsersView() {
  const [q, setQ] = useState('')
  const filtered = USERS.filter(
    (u) =>
      u.name.includes(q) ||
      u.username.includes(q) ||
      u.email.includes(q),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索姓名 / 账号 / 邮箱"
            className="pl-9"
          />
        </div>
        <NewUserDialog />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>部门</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>租户</TableHead>
              <TableHead>2FA</TableHead>
              <TableHead>会话</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最近登录</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {u.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.username} · {u.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{deptName(u.deptId)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <Badge key={r} variant="secondary" className="text-[10px]">
                        {roleName(r)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{tenantName(u.tenantId)}</TableCell>
                <TableCell>
                  {u.twoFA ? (
                    <span className="inline-flex items-center gap-1 text-xs text-chart-5">
                      <ShieldCheck className="size-3.5" /> 已开启
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldOff className="size-3.5" /> 未开启
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm tabular-nums text-muted-foreground">{u.sessions}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS[u.status].cls,
                    )}
                  >
                    {STATUS[u.status].label}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    <KeyRound className="size-3.5" /> 重置
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        共 {filtered.length} 个用户 · 邮箱全局唯一，登录后按归属自动落点到对应租户
      </p>
    </div>
  )
}

function NewUserDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus className="size-4" /> 新增用户</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增用户</DialogTitle>
          <DialogDescription>
            创建用户并分配部门与角色。初始密码将以 PBKDF2 哈希存储，首次登录需强制修改。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nu-name">姓名</Label>
              <Input id="nu-name" placeholder="真实姓名" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nu-username">账号</Label>
              <Input id="nu-username" placeholder="登录账号" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nu-email">邮箱（全局唯一）</Label>
            <Input id="nu-email" type="email" placeholder="name@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nu-phone">手机号</Label>
            <Input id="nu-phone" placeholder="11 位手机号" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={() => setOpen(false)}>创建</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
