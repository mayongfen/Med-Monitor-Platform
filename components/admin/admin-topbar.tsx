'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronsUpDown, LogOut, Moon, Shield, Sun, User } from 'lucide-react'
import { AlarmBanner } from '@/components/monitor/alarm-banner'
import { TENANTS, EDITION_LABEL, USERS, ROLE_CODE_LABEL, type RoleCode } from '@/lib/admin-data'
import { useAuth, toAuthUser } from '@/lib/auth'
import { wardName } from '@/lib/ward-data'
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

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark')
  if (isDark) {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  } else {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }
}

function wardScopeLabel(wardIds: string[]): string {
  if (wardIds.length === 0) return '全部病区'
  return wardIds.map(wardName).join(' / ')
}

export function AdminTopbar({ title, onOpenMobile }: { title: string; onOpenMobile?: () => void }) {
  const router = useRouter()
  const { user, role, name, wardIds, setUser, logout } = useAuth()
  const [tenant, setTenant] = useState(TENANTS[1])
  const isPlatform = tenant.id === 0

  function doLogout() {
    logout()
    router.push('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        {/* 移动端汉堡 */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobile}>
          <Building2 className="size-5" />
        </Button>
        <h1 className="shrink-0 text-base font-semibold text-foreground">{title}</h1>
        {/* 告警滚动条（与主题按钮同层级） */}
        <AlarmBanner />
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        {/* 主题切换 */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="切换主题">
          <Sun className="size-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>

        {/* 租户切换 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="hidden gap-2 sm:flex">
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
          <Badge className="hidden gap-1 bg-chart-4 text-white sm:inline-flex">
            <Shield className="size-3" /> 平台运维态
          </Badge>
        )}

        {/* 演示用户切换（携带角色 + 负责病区，联动告警过滤） */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {name?.[0] ?? '管'}
                </span>
                <span className="hidden flex-col items-start leading-tight sm:flex">
                  <span className="text-xs font-medium text-foreground">{name || '未登录'}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {ROLE_CODE_LABEL[role]} · {wardScopeLabel(wardIds)}
                  </span>
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">切换演示用户（联动角色与病区告警过滤）</div>
            <DropdownMenuSeparator />
            {USERS.map((u) => {
              const uRole = (u.roles[0] as RoleCode) ?? 'NURSE'
              const active = u.id === user.id
              return (
                <DropdownMenuItem
                  key={u.id}
                  onClick={() => setUser(toAuthUser(u.id))}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-foreground">{u.name}</span>
                      {u.status !== 'active' && (
                        <Badge variant="secondary" className="text-[9px]">
                          {u.status === 'locked' ? '锁定' : '禁用'}
                        </Badge>
                      )}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {ROLE_CODE_LABEL[uRole]} · {wardScopeLabel(u.wardIds)}
                    </span>
                  </span>
                  {active && <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-4" /> 个人中心
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="size-4" /> 会话与安全
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={cn('text-destructive')} onClick={doLogout}>
              <LogOut className="size-4" /> 退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
