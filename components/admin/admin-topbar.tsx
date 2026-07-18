'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronsUpDown, LogOut, Moon, Shield, Sun, User } from 'lucide-react'
import { AlarmBanner } from '@/components/monitor/alarm-banner'
import { TENANTS, EDITION_LABEL, type Role } from '@/lib/admin-data'
import { useAuth, ROLE_OPTIONS } from '@/lib/auth'
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

export function AdminTopbar({ title, onOpenMobile }: { title: string; onOpenMobile?: () => void }) {
  const router = useRouter()
  const { role, name, setRole, logout } = useAuth()
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

        {/* 角色切换（演示权限过滤） */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {name?.[0] ?? '管'}
                </span>
                <span className="hidden sm:inline">{name || '未登录'}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">切换角色（演示权限）</div>
            <DropdownMenuSeparator />
            {ROLE_OPTIONS.map((r) => (
              <DropdownMenuItem
                key={r.code}
                onClick={() => setRole(r.code as Role)}
                className="flex items-center justify-between"
              >
                <span>{r.name}</span>
                {role === r.code && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
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
