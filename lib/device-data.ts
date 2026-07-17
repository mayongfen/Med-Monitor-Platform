// 机构版 · 监护垫设备生命周期数据

export type DeviceStatus = 'in_use' | 'standby' | 'fault' | 'scrapped'

export interface Device {
  id: string
  code: string
  model: string
  status: DeviceStatus
  wardId?: string
  bedId?: string
  inStockAt: string
  keeper: string
  originValue: number
  maintainDueAt: string
  maintainCount: number
}

export interface MaintainLog {
  id: string
  deviceId: string
  at: string
  content: string
  parts: string
  operator: string
}

export const DEVICES_LIFECYCLE: Device[] = [
  { id: 'D001', code: 'MD-20250201-001', model: 'VM-8000', status: 'in_use', wardId: 'W01', bedId: 'W01-01', inStockAt: '2025-02-01', keeper: '王芳', originValue: 18000, maintainDueAt: '2026-02-01', maintainCount: 1 },
  { id: 'D002', code: 'MD-20250201-002', model: 'VM-8000', status: 'in_use', wardId: 'W01', bedId: 'W01-02', inStockAt: '2025-02-01', keeper: '王芳', originValue: 18000, maintainDueAt: '2026-02-01', maintainCount: 1 },
  { id: 'D003', code: 'MD-20250201-003', model: 'VM-6000', status: 'in_use', wardId: 'W01', bedId: 'W01-03', inStockAt: '2025-02-01', keeper: '刘护士长', originValue: 12000, maintainDueAt: '2026-02-01', maintainCount: 0 },
  { id: 'D004', code: 'MD-20250201-004', model: 'VM-8000', status: 'in_use', wardId: 'W01', bedId: 'W01-04', inStockAt: '2025-02-01', keeper: '王芳', originValue: 18000, maintainDueAt: '2026-02-01', maintainCount: 1 },
  { id: 'D005', code: 'MD-20250201-005', model: 'VM-8000', status: 'in_use', wardId: 'W01', bedId: 'W01-05', inStockAt: '2025-02-01', keeper: '王芳', originValue: 18000, maintainDueAt: '2026-02-01', maintainCount: 0 },
  { id: 'D006', code: 'MD-20250305-006', model: 'VM-8000', status: 'in_use', wardId: 'W02', bedId: 'W02-01', inStockAt: '2025-03-05', keeper: '刘护士长', originValue: 18000, maintainDueAt: '2026-03-05', maintainCount: 0 },
  { id: 'D007', code: 'MD-20250305-007', model: 'VM-6000', status: 'in_use', wardId: 'W02', bedId: 'W02-02', inStockAt: '2025-03-05', keeper: '刘护士长', originValue: 12000, maintainDueAt: '2026-03-05', maintainCount: 1 },
  { id: 'D008', code: 'MD-20250305-008', model: 'VM-8000', status: 'in_use', wardId: 'W02', bedId: 'W02-04', inStockAt: '2025-03-05', keeper: '刘护士长', originValue: 18000, maintainDueAt: '2026-03-05', maintainCount: 0 },
  { id: 'D009', code: 'MD-20250410-009', model: 'VM-6000', status: 'in_use', wardId: 'W03', bedId: 'W03-01', inStockAt: '2025-04-10', keeper: '陈工', originValue: 12000, maintainDueAt: '2026-04-10', maintainCount: 0 },
  { id: 'D010', code: 'MD-20250410-010', model: 'VM-6000', status: 'in_use', wardId: 'W03', bedId: 'W03-03', inStockAt: '2025-04-10', keeper: '陈工', originValue: 12000, maintainDueAt: '2026-04-10', maintainCount: 1 },
  { id: 'D011', code: 'MD-20250515-011', model: 'VM-8000', status: 'standby', inStockAt: '2025-05-15', keeper: '陈工', originValue: 18000, maintainDueAt: '2026-05-15', maintainCount: 0 },
  { id: 'D012', code: 'MD-20250201-012', model: 'VM-6000', status: 'fault', wardId: 'W01', bedId: 'W01-08', inStockAt: '2025-02-01', keeper: '陈工', originValue: 12000, maintainDueAt: '2026-02-01', maintainCount: 2 },
]

export const MAINTAIN_LOGS: MaintainLog[] = [
  { id: 'M-001', deviceId: 'D001', at: '2025-08-01', content: '传感器精度校准', parts: '压力传感器模组', operator: '陈工' },
  { id: 'M-002', deviceId: 'D002', at: '2025-08-01', content: '定期更换传感垫', parts: '传感垫×1', operator: '陈工' },
  { id: 'M-003', deviceId: 'D004', at: '2025-09-12', content: '电源模块检测', parts: '—', operator: '陈工' },
  { id: 'M-004', deviceId: 'D007', at: '2025-10-20', content: '通信模块固件升级', parts: '—', operator: '陈工' },
  { id: 'M-005', deviceId: 'D010', at: '2025-11-05', content: '定期更换传感垫', parts: '传感垫×1', operator: '陈工' },
  { id: 'M-006', deviceId: 'D012', at: '2026-06-18', content: '信号丢失故障排查', parts: '无线模组（待件）', operator: '陈工' },
]

export const DEVICE_STATUS_LABEL: Record<DeviceStatus, string> = {
  in_use: '在用',
  standby: '库存备用',
  fault: '故障',
  scrapped: '报废',
}

export const DEVICE_STATUS_META: Record<DeviceStatus, { cls: string; dot: string }> = {
  in_use: { cls: 'bg-chart-5/10 text-chart-5', dot: 'bg-chart-5' },
  standby: { cls: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  fault: { cls: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  scrapped: { cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
}

// 直线折旧法（年限 3 年）
export function depreciation(device: Device): { perYear: number; accumulated: number; netValue: number } {
  const years = 3
  const perYear = device.originValue / years
  const inDate = new Date(device.inStockAt)
  const monthsElapsed = Math.max(0, (new Date('2026-07-18').getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  const yearsElapsed = monthsElapsed / 12
  const accumulated = Math.min(device.originValue, perYear * yearsElapsed)
  return { perYear, accumulated: Math.round(accumulated), netValue: Math.round(device.originValue - accumulated) }
}

export function deviceStats() {
  return DEVICES_LIFECYCLE.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1
      return acc
    },
    {} as Record<DeviceStatus, number>,
  )
}
