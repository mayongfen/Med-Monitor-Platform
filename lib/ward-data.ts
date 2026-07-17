// 机构版 · 病区与床位数据

export type WardType = 'icu' | 'general' | 'isolation' | 'operating'
export type WardStatus = 'open' | 'closed'
export type BedType = 'general' | 'icu_care' | 'neonatal' | 'operating'
export type BedStatus = 'idle' | 'occupied' | 'maintenance' | 'disinfect' | 'reserved'

export interface Ward {
  id: string
  name: string
  location: string
  dept: string
  type: WardType
  bedCount: number
  status: WardStatus
  createdAt: string
}

export interface Bed {
  id: string
  wardId: string
  code: string
  type: BedType
  status: BedStatus
  patientId?: string
  deviceId?: string
}

export const WARDS: Ward[] = [
  { id: 'W01', name: 'ICU-A', location: '3 层东区', dept: '内科', type: 'icu', bedCount: 8, status: 'open', createdAt: '2025-01-15' },
  { id: 'W02', name: 'ICU-B', location: '3 层西区', dept: '内科', type: 'icu', bedCount: 4, status: 'open', createdAt: '2025-01-15' },
  { id: 'W03', name: '普通病房 301', location: '3 层北区', dept: '内科', type: 'general', bedCount: 6, status: 'open', createdAt: '2025-03-01' },
  { id: 'W04', name: '隔离病房 201', location: '2 层南区', dept: '感染科', type: 'isolation', bedCount: 4, status: 'closed', createdAt: '2025-05-10' },
]

export const BEDS: Bed[] = [
  // ICU-A
  { id: 'W01-01', wardId: 'W01', code: '01', type: 'icu_care', status: 'occupied', patientId: 'P001', deviceId: 'D001' },
  { id: 'W01-02', wardId: 'W01', code: '02', type: 'icu_care', status: 'occupied', patientId: 'P002', deviceId: 'D002' },
  { id: 'W01-03', wardId: 'W01', code: '03', type: 'icu_care', status: 'occupied', patientId: 'P003', deviceId: 'D003' },
  { id: 'W01-04', wardId: 'W01', code: '04', type: 'icu_care', status: 'occupied', patientId: 'P004', deviceId: 'D004' },
  { id: 'W01-05', wardId: 'W01', code: '05', type: 'icu_care', status: 'occupied', patientId: 'P005', deviceId: 'D005' },
  { id: 'W01-06', wardId: 'W01', code: '06', type: 'icu_care', status: 'disinfect' },
  { id: 'W01-07', wardId: 'W01', code: '07', type: 'icu_care', status: 'idle' },
  { id: 'W01-08', wardId: 'W01', code: '08', type: 'icu_care', status: 'maintenance', deviceId: 'D012' },
  // ICU-B
  { id: 'W02-01', wardId: 'W02', code: '01', type: 'icu_care', status: 'occupied', patientId: 'P006', deviceId: 'D006' },
  { id: 'W02-02', wardId: 'W02', code: '02', type: 'icu_care', status: 'occupied', patientId: 'P007', deviceId: 'D007' },
  { id: 'W02-03', wardId: 'W02', code: '03', type: 'icu_care', status: 'idle' },
  { id: 'W02-04', wardId: 'W02', code: '04', type: 'icu_care', status: 'occupied', patientId: 'P008', deviceId: 'D008' },
  // 普通病房
  { id: 'W03-01', wardId: 'W03', code: '301-01', type: 'general', status: 'occupied', patientId: 'P009', deviceId: 'D009' },
  { id: 'W03-02', wardId: 'W03', code: '301-02', type: 'general', status: 'idle' },
  { id: 'W03-03', wardId: 'W03', code: '301-03', type: 'general', status: 'occupied', patientId: 'P010', deviceId: 'D010' },
  { id: 'W03-04', wardId: 'W03', code: '301-04', type: 'general', status: 'idle' },
  { id: 'W03-05', wardId: 'W03', code: '301-05', type: 'general', status: 'disinfect' },
  { id: 'W03-06', wardId: 'W03', code: '301-06', type: 'general', status: 'idle' },
  // 隔离病房
  { id: 'W04-01', wardId: 'W04', code: '201-01', type: 'general', status: 'idle' },
  { id: 'W04-02', wardId: 'W04', code: '201-02', type: 'general', status: 'reserved' },
  { id: 'W04-03', wardId: 'W04', code: '201-03', type: 'general', status: 'idle' },
  { id: 'W04-04', wardId: 'W04', code: '201-04', type: 'general', status: 'idle' },
]

export const WARD_TYPE_LABEL: Record<WardType, string> = {
  icu: '重症监护室',
  general: '普通病房',
  isolation: '隔离病房',
  operating: '手术室',
}

export const WARD_STATUS_LABEL: Record<WardStatus, string> = {
  open: '开启',
  closed: '关闭',
}

export const BED_TYPE_LABEL: Record<BedType, string> = {
  general: '普通床',
  icu_care: '加护床',
  neonatal: '新生儿床',
  operating: '手术床',
}

export const BED_STATUS_LABEL: Record<BedStatus, string> = {
  idle: '空闲',
  occupied: '占用',
  maintenance: '维修',
  disinfect: '消毒',
  reserved: '预占',
}

export const BED_STATUS_META: Record<BedStatus, { cls: string; dot: string }> = {
  idle: { cls: 'bg-chart-5/10 text-chart-5', dot: 'bg-chart-5' },
  occupied: { cls: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  maintenance: { cls: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  disinfect: { cls: 'bg-chart-4/15 text-chart-4', dot: 'bg-chart-4' },
  reserved: { cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
}

export function wardName(id: string) {
  return WARDS.find((w) => w.id === id)?.name ?? id
}

export function bedStatusCount(wardId?: string) {
  const beds = wardId ? BEDS.filter((b) => b.wardId === wardId) : BEDS
  return BEDS.reduce(
    (acc, b) => {
      if (wardId && b.wardId !== wardId) return acc
      acc[b.status] = (acc[b.status] ?? 0) + 1
      return acc
    },
    {} as Record<BedStatus, number>,
  )
}
