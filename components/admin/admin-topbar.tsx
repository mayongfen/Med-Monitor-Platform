'use client'

import { useState } from 'react'
import { Building2, Check, ChevronsUpDown, LogOut, Shield, User } from 'lucide-react'
import { TENANTS, EDITION_LABEL } from '@/lib/admin-data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function AdminTopbar({ title }: { title: string }) {
  const [tenant, setTenant] = useState(TENANTS[1])
  const isPlatform = tenant.id === 0

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-5">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* 租户切换 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-2">
                <Building2 className="size-4 text-primary" />
                <span className="max-w-40 truncate">{tenant.name}</span>
                <ChevronsUpDown className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              超级管理员可切入任意租户代为管理
            </div>
            <DropdownMenuSeparator />
            {TENANTS.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTenant(t)}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  {t.id === 0 ? (
                    <Shield className="size-4 text-chart-4" />
                  ) : (
                    <Building2 className="size-4 text-muted-foreground" />
                  )}
                  <span className="truncate">{t.name}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {EDITION_LABEL[t.edition]}
                  </Badge>
                  {t.id === tenant.id && <Check className="size-3.5 text-primary" />}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isPlatform && (
          <Badge className="gap-1 bg-chart-4 text-white">
            <Shield className="size-3" /> 平台运维态
          </Badge>
        )}

        {/* 用户菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  管
                </span>
                <span className="hidden sm:inline">超级管理员</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="size-4" /> 个人中心
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="size-4" /> 会话与安全
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={cn('text-destructive')}>
              <LogOut className="size-4" /> 退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
