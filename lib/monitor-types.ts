export type DeviceStatus = 'normal' | 'warning' | 'critical' | 'offline'

export type VitalKey = 'heartRate' | 'respiration' | 'spo2' | 'temperature'

export interface VitalConfig {
  key: VitalKey
  label: string
  unit: string
  chart: string // css var color
  normal: [number, number]
  decimals: number
}

export const VITAL_CONFIGS: VitalConfig[] = [
  { key: 'heartRate', label: '心率', unit: 'bpm', chart: 'var(--chart-1)', normal: [60, 100], decimals: 0 },
  { key: 'respiration', label: '呼吸', unit: 'rpm', chart: 'var(--chart-2)', normal: [12, 20], decimals: 0 },
  { key: 'spo2', label: '血氧', unit: '%', chart: 'var(--chart-3)', normal: [95, 100], decimals: 0 },
  { key: 'temperature', label: '体温', unit: '°C', chart: 'var(--chart-4)', normal: [36.3, 37.2], decimals: 1 },
]

export interface Device {
  id: string
  name: string
  bed: string
  room: string
  age: number
  gender: '男' | '女'
  deviceModel: string
}

export interface VitalReading {
  value: number
  valid: boolean
}

export type Vitals = Record<VitalKey, VitalReading>

export interface TrendPoint {
  t: number
  time: string
  heartRate: number | null
  respiration: number | null
  spo2: number | null
  temperature: number | null
}

export const DEVICES: Device[] = [
  { id: 'BED-01', name: '张伟', bed: '01', room: 'ICU-A', age: 58, gender: '男', deviceModel: 'VM-8000' },
  { id: 'BED-02', name: '李秀英', bed: '02', room: 'ICU-A', age: 67, gender: '女', deviceModel: 'VM-8000' },
  { id: 'BED-03', name: '王强', bed: '03', room: 'ICU-A', age: 45, gender: '男', deviceModel: 'VM-6000' },
  { id: 'BED-04', name: '刘敏', bed: '04', room: 'ICU-B', age: 39, gender: '女', deviceModel: 'VM-8000' },
  { id: 'BED-05', name: '陈杰', bed: '05', room: 'ICU-B', age: 72, gender: '男', deviceModel: 'VM-6000' },
  { id: 'BED-06', name: '赵丽', bed: '06', room: 'ICU-B', age: 54, gender: '女', deviceModel: 'VM-8000' },
  { id: 'BED-07', name: '孙浩', bed: '07', room: 'CCU-1', age: 61, gender: '男', deviceModel: 'VM-8000' },
  { id: 'BED-08', name: '周芳', bed: '08', room: 'CCU-1', age: 48, gender: '女', deviceModel: 'VM-6000' },
]
