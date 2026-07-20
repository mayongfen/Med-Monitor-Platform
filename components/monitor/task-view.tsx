'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ClipboardList, Plus, Search, CheckCircle2, SkipForward, Clock, AlertTriangle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { wardName } from '@/lib/ward-data'
import { patientName } from '@/lib/patient-data'
import {
  TASK_TYPE_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUS_META,
  SHIFT_LABEL,
  type MonitorTask,
  type TaskStatus,
  type TaskType,
} from '@/lib/monitor-task-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TaskExecuteDialog, TaskCreateDialog } from './task-dialog'

const STATUS_TABS: (TaskStatus | 'all')[] = ['pending', 'doing', 'overdue', 'done', 'all']
const TYPE_FILTERS: (TaskType | 'all')[] = ['all', 'round', 'vital', 'turn', 'assess', 'intake', 'med', 'handover', 'device_check']

export function TaskView() {
  const { tasks, completeTask, cancelTask } = useStore()
  const [tab, setTab] = useState<TaskStatus | 'all'>('pending')
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all')
  const [execTask, setExecTask] = useState<MonitorTask | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const stats = useMemo(() => ({
    pending: tasks.filter((t) => t.status === 'pending').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }), [tasks])

  const list = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return tasks.filter((t) => {
      if (tab !== 'all' && t.status !== tab) return false
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (!kw) return true
      return (
        t.patientName.toLowerCase().includes(kw) ||
        t.bedId.toLowerCase().includes(kw) ||
        t.assigneeName.toLowerCase().includes(kw) ||
        t.id.toLowerCase().includes(kw)
      )
    })
  }, [tasks, tab, keyword, typeFilter])

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={<Clock className="size-4" />} label="待执行" value={stats.pending} accent="text-primary" />
        <Stat icon={<ClipboardList className="size-4" />} label="进行中" value={stats.doing} accent="text-chart-4" />
        <Stat icon={<AlertTriangle className="size-4" />} label="已超时" value={stats.overdue} accent="text-destructive" />
        <Stat icon={<CheckCircle2 className="size-4" />} label="今日已完成" value={stats.done} accent="text-chart-5" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ClipboardList className="size-4 text-primary" /> 监护任务
          </h2>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> 新建任务
          </Button>
        </div>

        {/* Tab 切换 */}
        <div className="mb-3 inline-flex rounded-lg border border-border p-0.5 text-xs">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1 transition-colors',
                tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {t === 'all' ? `全部 ${tasks.length}` : `${TASK_STATUS_LABEL[t]} ${stats[t as keyof typeof stats] ?? 0}`}
            </button>
          ))}
        </div>

        {/* 搜索 + 类型筛选 */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索患者 / 床位 / 负责人 / 任务编号"
              className="pl-8"
            />
          </div>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                typeFilter === f
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted',
              )}
            >
              {f === 'all' ? '全部类型' : TASK_TYPE_LABEL[f]}
            </button>
          ))}
        </div>

        {/* 任务表格 */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">任务编号</th>
                <th className="px-3 py-2 font-medium">类型</th>
                <th className="px-3 py-2 font-medium">患者/床位</th>
                <th className="px-3 py-2 font-medium">计划时间</th>
                <th className="px-3 py-2 font-medium">截止</th>
                <th className="px-3 py-2 font-medium">负责人</th>
                <th className="px-3 py-2 font-medium">班次</th>
                <th className="px-3 py-2 font-medium">状态</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => {
                const meta = TASK_STATUS_META[t.status]
                const isActionable = t.status === 'pending' || t.status === 'doing' || t.status === 'overdue'
                return (
                  <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-muted-foreground">{t.id}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground">
                        {TASK_TYPE_LABEL[t.type]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-foreground">{t.patientName}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {wardName(t.wardId)} {t.bedId.split('-').slice(-1)[0]}床
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{t.scheduledAt}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{t.deadline}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{t.assigneeName}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{SHIFT_LABEL[t.shift]}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]', meta.cls)}>
                        <span className={cn('size-1.5 rounded-full', meta.dot)} />
                        {TASK_STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {isActionable ? (
                        <div className="flex gap-2 text-xs">
                          <button
                            onClick={() => setExecTask(t)}
                            className="inline-flex items-center gap-0.5 text-chart-5 hover:underline"
                          >
                            <CheckCircle2 className="size-3" /> 执行
                          </button>
                          <span className="text-border">|</span>
                          <button
                            onClick={() => cancelTask(t.id, '手动跳过')}
                            className="inline-flex items-center gap-0.5 text-muted-foreground hover:underline"
                          >
                            <SkipForward className="size-3" /> 跳过
                          </button>
                        </div>
                      ) : t.status === 'done' ? (
                        <span className="text-xs text-muted-foreground/70">
                          {t.completedBy} · {t.completedAt?.slice(11)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">
                          {t.cancelReason ?? '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    暂无匹配的任务
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          入院时根据病区类型自动生成护理任务（ICU 每 1 小时巡视、每 2 小时翻身；普通病房每 4 小时巡视），支持手动创建临时任务，出院时自动终止未完成任务。
        </p>
      </div>

      <TaskExecuteDialog open={!!execTask} onOpenChange={(o) => !o && setExecTask(null)} task={execTask} />
      <TaskCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

function Stat({ icon, label, value, accent }: { icon: ReactNode; label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className={cn('shrink-0', accent)}>{icon}</span>
      </div>
      <p className={cn('mt-1 text-2xl font-bold tabular-nums', accent)}>{value}</p>
    </div>
  )
}
