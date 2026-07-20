// 机构版 · 告警规则配置（机构可调）

import type { AlarmType } from '@/lib/alarm-data'
import type { RoleCode } from '@/lib/admin-data'

export type AlarmOperator = 'lt' | 'gt' | 'lte' | 'gte'
export type RuleType = AlarmType | 'temperature'

export interface AlarmRule {
  id: string
  name: string
  type: RuleType
  metric: string
  op: AlarmOperator
  value: number
  unit: string
  level: 'warning' | 'critical'
  enabled: boolean
  // 通知角色：为空表示该规则对所有可见角色生效；非空时仅通知这些角色
  notifyRoles?: RoleCode[]
  remark: string
  updatedAt: string
}

// 复刻 use-monitor-data.ts 的 statusForVital 现有阈值，并按规格 6.5 收敛
export const ALARM_RULES: AlarmRule[] = [
  { id: 'R-HR-01', name: '心率过低（危急）', type: 'heart', metric: '心率', op: 'lt', value: 40, unit: 'bpm', level: 'critical', enabled: true, notifyRoles: ['DEPT_HEAD', 'DOCTOR', 'NURSE'], remark: '低于 40，立即告警', updatedAt: '2026-07-15' },
  { id: 'R-HR-02', name: '心率过高（危急）', type: 'heart', metric: '心率', op: 'gt', value: 160, unit: 'bpm', level: 'critical', enabled: true, notifyRoles: ['DEPT_HEAD', 'DOCTOR', 'NURSE'], remark: '高于 160，立即告警', updatedAt: '2026-07-15' },
  { id: 'R-HR-03', name: '心率偏低', type: 'heart', metric: '心率', op: 'lt', value: 60, unit: 'bpm', level: 'warning', enabled: true, notifyRoles: ['NURSE'], remark: '低于正常下限', updatedAt: '2026-07-15' },
  { id: 'R-HR-04', name: '心率偏高', type: 'heart', metric: '心率', op: 'gt', value: 100, unit: 'bpm', level: 'warning', enabled: true, notifyRoles: ['NURSE'], remark: '高于正常上限', updatedAt: '2026-07-15' },
  { id: 'R-RR-01', name: '呼吸过慢（危急）', type: 'breath', metric: '呼吸', op: 'lt', value: 8, unit: 'rpm', level: 'critical', enabled: true, notifyRoles: ['DEPT_HEAD', 'DOCTOR', 'NURSE'], remark: '低于 8，呼吸抑制风险', updatedAt: '2026-07-15' },
  { id: 'R-RR-02', name: '呼吸过快（危急）', type: 'breath', metric: '呼吸', op: 'gt', value: 28, unit: 'rpm', level: 'critical', enabled: true, notifyRoles: ['DEPT_HEAD', 'DOCTOR', 'NURSE'], remark: '高于 28，呼吸窘迫', updatedAt: '2026-07-15' },
  { id: 'R-SPO2-01', name: '血氧严重偏低', type: 'spo2', metric: '血氧', op: 'lt', value: 90, unit: '%', level: 'critical', enabled: true, notifyRoles: ['DEPT_HEAD', 'DOCTOR', 'NURSE'], remark: '低于 90%，缺氧', updatedAt: '2026-07-15' },
  { id: 'R-SPO2-02', name: '血氧偏低', type: 'spo2', metric: '血氧', op: 'lt', value: 95, unit: '%', level: 'warning', enabled: true, notifyRoles: ['NURSE'], remark: '低于正常下限', updatedAt: '2026-07-15' },
  { id: 'R-TEMP-01', name: '高热', type: 'temperature', metric: '体温', op: 'gte', value: 39, unit: '°C', level: 'critical', enabled: true, notifyRoles: ['DEPT_HEAD', 'DOCTOR', 'NURSE'], remark: '高热需处置', updatedAt: '2026-07-15' },
  { id: 'R-TEMP-02', name: '体温过低', type: 'temperature', metric: '体温', op: 'lt', value: 35.5, unit: '°C', level: 'critical', enabled: true, notifyRoles: ['DEPT_HEAD', 'DOCTOR', 'NURSE'], remark: '低体温', updatedAt: '2026-07-15' },
  { id: 'R-LEAVE-01', name: '持续离床', type: 'leave', metric: '离床', op: 'gt', value: 15, unit: '分钟', level: 'warning', enabled: true, notifyRoles: ['NURSE'], remark: '持续离床超 15 分钟（可配置）', updatedAt: '2026-07-15' },
  { id: 'R-DEV-01', name: '信号丢失', type: 'device', metric: '信号', op: 'gt', value: 30, unit: '秒', level: 'warning', enabled: true, notifyRoles: ['NURSE'], remark: '信号丢失超 30 秒（可配置）', updatedAt: '2026-07-15' },
]

export const OP_LABEL: Record<AlarmOperator, string> = {
  lt: '<',
  gt: '>',
  lte: '≤',
  gte: '≥',
}

export const RULE_TYPE_LABEL: Record<RuleType, string> = {
  heart: '心率',
  breath: '呼吸',
  leave: '离床',
  spo2: '血氧',
  device: '设备',
  temperature: '体温',
}

export function ruleStats() {
  const total = ALARM_RULES.length
  const enabled = ALARM_RULES.filter((r) => r.enabled).length
  const critical = ALARM_RULES.filter((r) => r.level === 'critical').length
  const byType = (Object.keys(RULE_TYPE_LABEL) as RuleType[]).map((t) => ({
    type: t,
    label: RULE_TYPE_LABEL[t],
    total: ALARM_RULES.filter((r) => r.type === t).length,
    enabled: ALARM_RULES.filter((r) => r.type === t && r.enabled).length,
  }))
  return { total, enabled, critical, byType }
}
