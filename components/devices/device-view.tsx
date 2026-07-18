'use client'

import { useState } from 'react'
import { Plus, HardDrive, Download } from 'lucide-react'
import { useStore } from '@/lib/store'
import { wardName } from '@/lib/ward-data'
import { depreciation, DEVICE_STATUS_LABEL, DEVICE_STATUS_META, type DeviceStatus } from '@/lib/device-data'
import { exportCSV } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DeviceActionDialog } from './device-action-dialog'
import { ImportDialog } from '@/components/ui/import-dialog'

export function DeviceView() {
  const { devices } = useStore()
  const [dialog, setDialog] = useState<{ open: boolean; deviceId: string | null; mode: 'bind' | 'unbind' | 'scrap' }>({ open: false, deviceId: null, mode: 'bind' })

  const [importOpen, setImportOpen] = useState(false)
  const order: DeviceStatus[] = ['in_use', 'standby', 'fault', 'scrapped']
  const counts = devices.reduce((acc, d) => { acc[d.status] = (acc[d.status] ?? 0) + 1; return acc }, {} as Record<DeviceStatus, number>)
  const totalValue = devices.reduce((s, d) => s + depreciation(d).netValue, 0)

  function open(deviceId: string, mode: typeof dialog.mode) {
    setDialog({ open: true, deviceId, mode })
  }

  function doExport() {
    const rows = devices.map((d) => {
      const dep = depreciation(d)
      return [d.code, d.model, DEVICE_STATUS_LABEL[d.status], d.bedId ?? '', d.inStockAt, d.keeper, String(d.originValue), String(dep.netValue)]
    })
    exportCSV(['设备编码', '型号', '状态', '床位', '入库时间', '保管人', '原值', '净值'], rows, '设备清单')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {order.map((s) => (
          <div key={s} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{DEVICE_STATUS_LABEL[s]}</p>
              <span className={cn('size-2 rounded-full', DEVICE_STATUS_META[s].dot)} />
            </div>
            <p className={cn('mt-1 text-2xl font-bold tabular-nums', DEVICE_STATUS_META[s].cls.split(' ')[1])}>
              {counts[s] ?? 0}<span className="ml-1 text-xs font-normal text-muted-foreground">台</span>
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <HardDrive className="size-4 text-primary" /> 监护垫设备清单
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}><Upload className="size-4" /> 导入</Button>
            <Button size="sm" variant="outline" onClick={doExport}><Download className="size-4" /> 导出</Button>
            <Button size="sm"><Plus className="size-4" /> 设备入库</Button>
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          管理总数 = 在用 {counts.in_use ?? 0} + 备用 {counts.standby ?? 0} + 故障 {counts.fault ?? 0} + 报废 {counts.scrapped ?? 0} · 当前资产净值合计 ¥{totalValue.toLocaleString()}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">设备编码</th>
                <th className="px-3 py-2 font-medium">型号</th>
                <th className="px-3 py-2 font-medium">状态</th>
                <th className="px-3 py-2 font-medium">绑定床位</th>
                <th className="px-3 py-2 font-medium">入库</th>
                <th className="px-3 py-2 font-medium">保管人</th>
                <th className="px-3 py-2 font-medium">净值</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => {
                const dep = depreciation(d)
                const meta = DEVICE_STATUS_META[d.status]
                return (
                  <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{d.code}</td>
                    <td className="px-3 py-2.5 font-medium text-foreground">{d.model}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]', meta.cls)}>
                        <span className={cn('size-1.5 rounded-full', meta.dot)} />
                        {DEVICE_STATUS_LABEL[d.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {d.bedId ? `${wardName(d.wardId!)} · ${d.bedId.split('-').slice(-1)[0]}床` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{d.inStockAt}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{d.keeper}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">¥{dep.netValue.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2 text-xs">
                        {d.status === 'standby' && <button onClick={() => open(d.id, 'bind')} className="text-primary hover:underline">绑定</button>}
                        {d.status === 'in_use' && <button onClick={() => open(d.id, 'unbind')} className="text-muted-foreground hover:underline">解绑</button>}
                        {d.status !== 'scrapped' && <button onClick={() => open(d.id, 'scrap')} className="text-destructive hover:underline">报废</button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeviceActionDialog open={dialog.open} onOpenChange={(o) => setDialog((s) => ({ ...s, open: o }))} deviceId={dialog.deviceId} mode={dialog.mode} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} title="设备" template={['设备编码','型号','入库时间','保管人','原值']} onImport={(rows) => { rows.forEach(() => {}); return rows.length }} />
    </div>
  )
}
