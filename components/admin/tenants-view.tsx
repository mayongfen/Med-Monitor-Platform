'use client'

import { Building2, CheckCircle2, PauseCircle, Plus, Users } from 'lucide-react'
import { TENANTS, EDITION_LABEL, type Tenant } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const EDITION_STYLE: Record<Tenant['edition'], string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-chart-3/15 text-chart-3',
  enterprise: 'bg-primary/15 text-primary',
}

export function TenantsView() {
  const active = TENANTS.filter((t) => t.status === 'active').length
  const totalUsers = TENANTS.reduce((sum, t) => sum + t.userCount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="租户总数" value={TENANTS.length} accent="text-primary" />
        <StatCard icon={CheckCircle2} label="活跃租户" value={active} accent="text-chart-5" />
        <StatCard icon={Users} label="累计用户" value={totalUsers} accent="text-chart-4" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">租户列表</h2>
          <Button size="sm" variant="outline">
            <Plus className="size-4" /> 开通租户
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">租户</th>
                <th className="px-3 py-2 font-medium">编码</th>
                <th className="px-3 py-2 font-medium">版本</th>
                <th className="px-3 py-2 font-medium">用户数</th>
                <th className="px-3 py-2 font-medium">状态</th>
                <th className="px-3 py-2 font-medium">开通时间</th>
              </tr>
            </thead>
            <tbody>
              {TENANTS.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                        <Building2 className="size-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{t.code}</td>
                  <td className="px-3 py-2.5">
                    <Badge className={cn('text-[10px]', EDITION_STYLE[t.edition])}>
                      {EDITION_LABEL[t.edition]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-foreground">{t.userCount}</td>
                  <td className="px-3 py-2.5">
                    {t.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-chart-5">
                        <CheckCircle2 className="size-3.5" /> 运行中
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <PauseCircle className="size-3.5" /> 已停用
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{t.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          租户实现字段级数据隔离，版本决定功能白名单门控；平台（全局）租户用于跨租户运维。
        </p>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Building2
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className={cn('size-5', accent)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}
