'use client'

import { useState } from 'react'
import { Plus, BedDouble } from 'lucide-react'
import { useStore } from '@/lib/store'
import { patientName } from '@/lib/patient-data'
import { WARDS, BED_STATUS_LABEL, BED_STATUS_META, BED_TYPE_LABEL, type BedStatus } from '@/lib/ward-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BedActionDialog } from './bed-action-dialog'
import { BedCardDialog } from '@/components/patients/bed-card-dialog'
import { useConfirm } from '@/components/ui/form-dialog'
import { toast } from 'sonner'

const STATUS_ORDER: BedStatus[] = ['occupied', 'idle', 'reserved', 'disinfect', 'maintenance']

export function BedView() {
  const { beds } = useStore()
  const [wardId, setWardId] = useState<string>('all')
  const [dialog, setDialog] = useState<{ open: boolean; bedId: string | null; mode: 'assign' | 'change' | 'unbind' | 'status' }>({ open: false, bedId: null, mode: 'assign' })
  const [cardBedId, setCardBedId] = useState<string | null>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const bedsList = wardId === 'all' ? beds : beds.filter((b) => b.wardId === wardId)
  const grouped = WARDS.map((w) => ({ ward: w, beds: beds.filter((b) => b.wardId === w.id) })).filter((g) => wardId === 'all' || g.ward.id === wardId)

  function openDialog(bedId: string, mode: typeof dialog.mode) {
    setDialog({ open: true, bedId, mode })
  }

  async function handleDelete(bedId: string) {
    const ok = await confirm({ title: '删除床位？', description: `床位 ${bedId} 删除后不可恢复。`, variant: 'destructive' })
    if (ok) toast.info('演示环境：删除操作未持久化')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BedDouble className="size-4 text-primary" /> 床位看板
          </h2>
          <div className="flex items-center gap-2">
            <div className="inline-flex flex-wrap gap-1.5">
              <button
                onClick={() => setWardId('all')}
                className={cn('rounded-full px-2.5 py-1 text-xs transition-colors', wardId === 'all' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground')}
              >全部</button>
              {WARDS.map((w) => (
                <button key={w.id} onClick={() => setWardId(w.id)}
                  className={cn('rounded-full px-2.5 py-1 text-xs transition-colors', wardId === w.id ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground')}
                >{w.name}</button>
              ))}
            </div>
            <Button size="sm"><Plus className="size-4" /> 新增床位</Button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-3">
          {STATUS_ORDER.map((s) => {
            const c = bedsList.filter((b) => b.status === s).length
            return (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn('size-2 rounded-full', BED_STATUS_META[s].dot)} />
                {BED_STATUS_LABEL[s]} {c}
              </span>
            )
          })}
        </div>

        <div className="space-y-4">
          {grouped.map(({ ward, beds: wbeds }) => (
            <div key={ward.id}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">{ward.name}</h3>
                <span className="text-xs text-muted-foreground">{ward.location} · {ward.dept}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {wbeds.map((b) => {
                  const meta = BED_STATUS_META[b.status]
                  return (
                    <div
                      key={b.id}
                      className={cn('group relative rounded-lg border p-2.5 transition-colors hover:shadow-sm', b.status === 'maintenance' ? 'border-destructive/40' : 'border-border')}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-medium text-foreground">{b.code}床</span>
                        <span className={cn('size-2 rounded-full', meta.dot, b.status === 'maintenance' && 'animate-pulse')} />
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{BED_TYPE_LABEL[b.type]}</p>
                      <div className="mt-1.5">
                        <span className={cn('inline-flex rounded px-1.5 py-0.5 text-[10px]', meta.cls)}>{BED_STATUS_LABEL[b.status]}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-foreground">{b.patientId ? patientName(b.patientId) : '—'}</p>
                      {/* 悬停操作 */}
                      <div className="mt-1.5 flex flex-wrap gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {b.status === 'idle' && (
                          <button onClick={() => openDialog(b.id, 'assign')} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20">分配</button>
                        )}
                        {b.status === 'occupied' && (
                          <>
                            <button onClick={() => setCardBedId(b.id)} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20">床头卡</button>
                            <button onClick={() => openDialog(b.id, 'change')} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground hover:bg-muted/70">换床</button>
                            <button onClick={() => openDialog(b.id, 'unbind')} className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive hover:bg-destructive/20">解绑</button>
                          </>
                        )}
                        <button onClick={() => openDialog(b.id, 'status')} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/70">状态</button>
                        <button onClick={() => handleDelete(b.id)} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-destructive hover:bg-destructive/10">删</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          悬停床位卡片显示操作：分配患者、换床、解绑（转待消毒）、状态调整；同一时间一张床仅绑一台设备。
        </p>
      </div>

      <BedActionDialog open={dialog.open} onOpenChange={(o) => setDialog((s) => ({ ...s, open: o }))} bedId={dialog.bedId} mode={dialog.mode} />
      <BedCardDialog open={!!cardBedId} onOpenChange={(o) => !o && setCardBedId(null)} bedId={cardBedId} />
      {confirmDialog}
    </div>
  )
}
