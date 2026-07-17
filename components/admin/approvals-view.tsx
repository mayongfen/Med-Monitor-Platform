'use client'

import { CheckCircle2, Clock, GitPullRequestArrow, KeyRound, UserPlus, XCircle } from 'lucide-react'
import { APPROVALS, APPROVAL_STATUS_LABEL, type ApprovalRequest } from '@/lib/admin-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STATUS_META: Record<
  ApprovalRequest['status'],
  { icon: typeof Clock; cls: string }
> = {
  pending: { icon: Clock, cls: 'text-chart-4' },
  approved: { icon: CheckCircle2, cls: 'text-chart-5' },
  rejected: { icon: XCircle, cls: 'text-destructive' },
}

export function ApprovalsView() {
  const pending = APPROVALS.filter((a) => a.status === 'pending')
  const history = APPROVALS.filter((a) => a.status !== 'pending')

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            待我审批
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {pending.length}
            </Badge>
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {pending.map((a) => (
            <RequestCard key={a.id} req={a} actionable />
          ))}
          {pending.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">暂无待审批事项</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">历史记录</h2>
        <div className="flex flex-col gap-3">
          {history.map((a) => (
            <RequestCard key={a.id} req={a} />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          权限申请走「申请 → 审批 → 授予」闭环；委托授权为临时性，到期自动回收，全过程写入权限变更审计日志。
        </p>
      </section>
    </div>
  )
}

function RequestCard({ req, actionable }: { req: ApprovalRequest; actionable?: boolean }) {
  const meta = STATUS_META[req.status]
  const isDelegate = req.type === 'delegate'
  return (
    <div className="rounded-lg border border-border p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
            {isDelegate ? (
              <GitPullRequestArrow className="size-4 text-chart-3" />
            ) : (
              <KeyRound className="size-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {isDelegate ? '委托授权' : '权限申请'}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">{req.id}</span>
            </div>
            <p className="mt-1 text-sm text-foreground">
              <span className="font-medium">{req.applicant}</span>
              <span className="text-muted-foreground">
                {isDelegate ? ' 委托给 ' : ' 申请 '}
              </span>
              <span className="font-mono text-xs">{req.target}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {req.reason} · 范围：{req.scope}
              {req.expireAt && ` · 到期：${req.expireAt}`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {req.createdAt} · 审批人 {req.approver}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1 text-xs font-medium', meta.cls)}>
            <meta.icon className="size-3.5" />
            {APPROVAL_STATUS_LABEL[req.status]}
          </span>
        </div>
      </div>

      {actionable && (
        <div className="mt-3 flex justify-end gap-2 border-t border-border/60 pt-3">
          <Button size="sm" variant="outline">
            <XCircle className="size-4" /> 驳回
          </Button>
          <Button size="sm">
            <CheckCircle2 className="size-4" /> 通过
          </Button>
        </div>
      )}
    </div>
  )
}
