'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, HeartPulse, LayoutGrid } from 'lucide-react'
import type { Alarm } from '@/hooks/use-monitor-data'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

export function TopNav({ alarms }: { alarms: Alarm[] }) {
  const [now, setNow] = useState<string>('')
  const criticalCount = alarms.filter((a) => a.level === 'critical').length

  useEffect(() => {
    const update = () => setNow(new Date().toLocaleString('zh-CN', { hour12: false }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HeartPulse className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">智联医护 · 实时监护中心</p>
          <p className="text-xs text-muted-foreground">ICU / CCU 多床位床旁监测</p>
        </div>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <div className="text-right">
          <p className="font-mono text-sm tabular-nums text-foreground">{now || '--:--:--'}</p>
          <p className="text-xs text-muted-foreground">系统时间</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/admin/users" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <LayoutGrid className="size-4" /> 管理后台
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="relative" aria-label="报警通知" />}
          >
            <Bell className="size-5" />
            {alarms.length > 0 && (
              <span
                className={`absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white ${
                  criticalCount > 0 ? 'animate-pulse bg-destructive' : 'bg-chart-4'
                }`}
              >
                {alarms.length > 99 ? '99+' : alarms.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-1.5 py-1 text-sm font-medium text-foreground">
              <span>报警通知</span>
              <span className="text-xs font-normal text-muted-foreground">
                危急 {criticalCount} · 共 {alarms.length}
              </span>
            </div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-72">
              {alarms.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">暂无报警</p>
              ) : (
                <div className="flex flex-col">
                  {alarms.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-accent/40">
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${
                          a.level === 'critical' ? 'bg-destructive' : 'bg-chart-4'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          <span className="font-medium">{a.bed}床 {a.deviceName}</span> · {a.message}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="size-8">
          <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">医</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
