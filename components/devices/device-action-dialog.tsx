'use client'

import { useStore } from '@/lib/store'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/form-dialog'
import { toast } from 'sonner'
import type { DeviceStatus } from '@/lib/device-data'

export function DeviceActionDialog({
  open,
  onOpenChange,
  deviceId,
  mode,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  deviceId: string | null
  mode: 'bind' | 'unbind' | 'scrap'
}) {
  const { devices, beds, bindDevice, unbindDevice, scrapDevice } = useStore()
  const { confirm, dialog } = useConfirm()

  const device = devices.find((d) => d.id === deviceId)
  if (!device) return null

  const idleBeds = beds.filter((b) => b.status === 'idle')

  async function handle(action: () => void, msg: string) {
    if (mode === 'scrap') {
      const ok = await confirm({
        title: '确认报废？',
        description: `设备 ${device!.code} 报废后不可恢复，资产净值将清零。`,
        variant: 'destructive',
        confirmText: '确认报废',
      })
      if (!ok) return
    }
    action()
    toast.success(msg)
    onOpenChange(false)
  }

  const titles: Record<string, string> = {
    bind: '绑定床位',
    unbind: '解绑设备',
    scrap: '设备报废',
  }

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={titles[mode]}
        description={`设备：${device.code} · ${device.model} · 当前状态：${device.status}`}
        footer={
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button
              variant={mode === 'scrap' || mode === 'unbind' ? 'destructive' : 'default'}
              onClick={() => {
                if (mode === 'unbind') handle(() => unbindDevice(device!.id), '设备已解绑，转备用')
                else if (mode === 'scrap') handle(() => scrapDevice(device!.id), '设备已报废')
              }}
            >
              {mode === 'scrap' ? '确认报废' : mode === 'unbind' ? '确认解绑' : '确认'}
            </Button>
          </>
        }
      >
        {mode === 'bind' && (
          <div className="text-sm text-muted-foreground">
            <p>选择空闲床位后绑定：</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {idleBeds.length === 0 && <span className="text-destructive">无空闲床位</span>}
              {idleBeds.map((b) => (
                <Button
                  key={b.id}
                  size="sm"
                  variant="outline"
                  onClick={() => { bindDevice(device.id, b.id); toast.success('设备已绑定床位'); onOpenChange(false) }}
                >
                  {b.id} · {b.code}床
                </Button>
              ))}
            </div>
          </div>
        )}
        {mode === 'unbind' && <p className="text-sm text-muted-foreground">解绑后设备转"备用"，床位设备关联解除。</p>}
        {mode === 'scrap' && <p className="text-sm text-destructive">报废后资产净值清零，不可恢复。</p>}
      </FormDialog>
      {dialog}
    </>
  )
}
