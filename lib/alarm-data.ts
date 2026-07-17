// 机构版 · 告警记录与统计

export type AlarmType = 'heart' | 'breath' | 'leave' | 'spo2' | 'device'
export type AlarmLevel = 'warning' | 'critical'
export type AlarmStatus = 'pending' | 'handled' | 'ignored'

export interface AlarmRecord {
  id: string
  patientId: string
  bedId: string
  type: AlarmType
  level: AlarmLevel
  message: string
  status: AlarmStatus
  raisedAt: string
  handler?: string
  result?: string
}

export const ALARM_RECORDS: AlarmRecord[] = [
  { id: 'AL-20260718-001', patientId: 'P001', bedId: 'W01-01', type: 'heart', level: 'critical', message: '心率 38 bpm，低于危急阈值 40', status: 'pending', raisedAt: '2026-07-18 06:42' },
  { id: 'AL-20260718-002', patientId: 'P005', bedId: 'W01-05', type: 'breath', level: 'warning', message: '呼吸频率 24 rpm，超出正常范围', status: 'pending', raisedAt: '2026-07-18 06:35' },
  { id: 'AL-20260718-003', patientId: 'P007', bedId: 'W02-02', type: 'leave', level: 'warning', message: '持续离床 18 分钟', status: 'pending', raisedAt: '2026-07-18 06:20' },
  { id: 'AL-20260718-004', patientId: 'P004', bedId: 'W01-04', type: 'spo2', level: 'critical', message: '血氧饱和度 88%，低于 90%', status: 'pending', raisedAt: '2026-07-18 05:58' },
  { id: 'AL-20260718-005', patientId: 'P010', bedId: 'W03-03', type: 'device', level: 'warning', message: '信号丢失 35 秒', status: 'pending', raisedAt: '2026-07-18 05:40' },
  { id: 'AL-20260717-021', patientId: 'P002', bedId: 'W01-02', type: 'heart', level: 'warning', message: '心率 108 bpm，超出正常范围', status: 'handled', raisedAt: '2026-07-17 23:15', handler: '王芳', result: '已评估，药物调整' },
  { id: 'AL-20260717-022', patientId: 'P006', bedId: 'W02-01', type: 'breath', level: 'warning', message: '呼吸频率 22 rpm', status: 'handled', raisedAt: '2026-07-17 21:08', handler: '刘护士长', result: '体位调整后恢复' },
  { id: 'AL-20260717-023', patientId: 'P008', bedId: 'W02-04', type: 'leave', level: 'warning', message: '持续离床 16 分钟', status: 'handled', raisedAt: '2026-07-17 20:30', handler: '刘护士长', result: '患者如厕，已返床' },
  { id: 'AL-20260717-024', patientId: 'P003', bedId: 'W01-03', type: 'spo2', level: 'warning', message: '血氧 93%', status: 'handled', raisedAt: '2026-07-17 19:42', handler: '王芳', result: '吸氧后恢复 97%' },
  { id: 'AL-20260717-025', patientId: 'P001', bedId: 'W01-01', type: 'heart', level: 'critical', message: '心率 165 bpm，高于危急阈值', status: 'handled', raisedAt: '2026-07-17 18:20', handler: '张主任', result: '已转接医生处置' },
  { id: 'AL-20260716-031', patientId: 'P005', bedId: 'W01-05', type: 'breath', level: 'critical', message: '呼吸 10 rpm，低于正常下限', status: 'handled', raisedAt: '2026-07-16 15:10', handler: '张主任', result: '已处置' },
  { id: 'AL-20260716-032', patientId: 'P007', bedId: 'W02-02', type: 'heart', level: 'warning', message: '心率 112 bpm', status: 'handled', raisedAt: '2026-07-16 14:05', handler: '王芳', result: '一过性，观察' },
  { id: 'AL-20260716-033', patientId: 'P009', bedId: 'W03-01', type: 'device', level: 'warning', message: '信号丢失 32 秒', status: 'ignored', raisedAt: '2026-07-16 11:22', handler: '陈工', result: '误报，传感器接触不良' },
  { id: 'AL-20260715-040', patientId: 'P010', bedId: 'W03-03', type: 'leave', level: 'warning', message: '持续离床 20 分钟', status: 'handled', raisedAt: '2026-07-15 22:48', handler: '刘护士长', result: '家属陪同检查' },
  { id: 'AL-20260715-041', patientId: 'P004', bedId: 'W01-04', type: 'heart', level: 'warning', message: '心率 105 bpm', status: 'handled', raisedAt: '2026-07-15 20:14', handler: '王芳', result: '已评估' },
]

export const ALARM_TYPE_LABEL: Record<AlarmType, string> = {
  heart: '心率',
  breath: '呼吸',
  leave: '离床',
  spo2: '血氧',
  device: '设备',
}

export const ALARM_LEVEL_META: Record<AlarmLevel, { cls: string; dot: string; label: string }> = {
  warning: { cls: 'bg-chart-4/15 text-chart-4', dot: 'bg-chart-4', label: '预警' },
  critical: { cls: 'bg-destructive/10 text-destructive', dot: 'bg-destructive', label: '危急' },
}

export const ALARM_STATUS_LABEL: Record<AlarmStatus, string> = {
  pending: '未处理',
  handled: '已处理',
  ignored: '已忽略',
}

export const ALARM_STATUS_META: Record<AlarmStatus, { cls: string }> = {
  pending: { cls: 'bg-destructive/10 text-destructive' },
  handled: { cls: 'bg-chart-5/10 text-chart-5' },
  ignored: { cls: 'bg-muted text-muted-foreground' },
}

export function alarmStats() {
  const total = ALARM_RECORDS.length
  const handled = ALARM_RECORDS.filter((a) => a.status === 'handled').length
  const pending = ALARM_RECORDS.filter((a) => a.status === 'pending').length
  const byType = (Object.keys(ALARM_TYPE_LABEL) as AlarmType[]).map((t) => ({
    type: t,
    label: ALARM_TYPE_LABEL[t],
    count: ALARM_RECORDS.filter((a) => a.type === t).length,
  }))
  // 近 7 天分布（模拟）
  const byWeek = ['7/12', '7/13', '7/14', '7/15', '7/16', '7/17', '7/18'].map((d, i) => ({
    day: d,
    count: [3, 1, 0, 2, 4, 3, 2][i],
  }))
  return { total, handled, pending, byType, byWeek }
}
