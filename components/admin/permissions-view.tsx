'use client'

import { Check, Minus } from 'lucide-react'
import { PERMISSIONS, PERMISSION_ROLE_CODES, ROLES, RISK_LABEL, type Permission } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const RISK_STYLE: Record<Permission['risk'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-chart-4/15 text-chart-4',
  high: 'bg-destructive/15 text-destructive',
}

function roleName(code: string) {
  return ROLES.find((r) => r.code === code)?.name ?? code
}

export function PermissionsView() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">权限 · 角色矩阵</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Check className="size-3.5 text-chart-5" /> 已授权
          </span>
          <span className="inline-flex items-center gap-1">
            <Minus className="size-3.5" /> 未授权
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">权限</th>
              <th className="px-3 py-2 font-medium">权限码</th>
              <th className="px-3 py-2 font-medium">分组</th>
              <th className="px-3 py-2 font-medium">风险</th>
              {PERMISSION_ROLE_CODES.map((code) => (
                <th key={code} className="px-2 py-2 text-center font-medium">
                  {roleName(code)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{p.name}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.code}</td>
                <td className="px-3 py-2.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {p.group}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">
                  <Badge className={cn('text-[10px]', RISK_STYLE[p.risk])}>{RISK_LABEL[p.risk]}</Badge>
                </td>
                {PERMISSION_ROLE_CODES.map((code) => (
                  <td key={code} className="px-2 py-2.5 text-center">
                    {p.roles[code] ? (
                      <Check className="mx-auto size-4 text-chart-5" />
                    ) : (
                      <Minus className="mx-auto size-4 text-muted-foreground/40" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        权限码遵循 <code className="rounded bg-muted px-1">resource:action:scope</code> 规范；结合 ABAC
        数据范围与字段脱敏，高风险权限受动态职责分离约束，需二次审批。
      </p>
    </div>
  )
}
