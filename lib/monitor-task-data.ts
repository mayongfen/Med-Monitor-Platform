// 机构版 · 监护任务数据模型与种子数据

import type { WardType } from '@/lib/ward-data'
import type { AdmissionType } from '@/lib/patient-data'
import { patientName } from '@/lib/patient-data'
import { BEDS, WARDS } from '@/lib/ward-data'

export type TaskType =
  | 'round'        // 巡视
  | 'turn'         // 翻身
  | 'vital'        // 体征记录
  | 'intake'       // 出入量
  | 'med'          // 给药
  | 'handover'     // 交接班
  | 'assess'       // 入科评估
  | 'device_check' // 设备检查

export type TaskStatus = 'pending' | 'doing' | 'done' | 'overdue' | 'cancelled'

export type Shift = 'day' | 'evening' | 'night'

export type TaskSource = 'auto' | 'manual'

export interface MonitorTask {
  id: string
  type: TaskType
  patientId: string
  patientName: string
  bedId: string
  wardId: string
  scheduledAt: string
  deadline: string
  assigneeName: string
  shift: Shift
  status: TaskStatus
  completedAt?: string
  completedBy?: string
  result?: string
  cancelReason?: string
  source: TaskSource
  createdAt: string
}

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  round: '巡视',
  turn: '翻身',
  vital: '体征记录',
  intake: '出入量',
  med: '给药',
  handover: '交接班',
  assess: '入科评估',
  device_check: '设备检查',
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pending: '待执行',
  doing: '进行中',
  done: '已完成',
  overdue: '已超时',
  cancelled: '已取消',
}

export const TASK_STATUS_META: Record<TaskStatus, { cls: string; dot: string }> = {
  pending: { cls: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  doing: { cls: 'bg-chart-4/15 text-chart-4', dot: 'bg-chart-4' },
  done: { cls: 'bg-chart-5/10 text-chart-5', dot: 'bg-chart-5' },
  overdue: { cls: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  cancelled: { cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
}

export const SHIFT_LABEL: Record<Shift, string> = {
  day: '白班',
  evening: '晚班',
  night: '夜班',
}

// ── 辅助函数 ──────────────────────────────────────────

const NOW = new Date('2026-07-18T10:00:00')

function fmtTime(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

export function currentShift(hour: number): Shift {
  if (hour >= 8 && hour < 16) return 'day'
  if (hour >= 16 && hour < 24) return 'evening'
  return 'night'
}

function defaultAssignee(wardId: string): string {
  if (wardId === 'W01') return '王芳'
  if (wardId === 'W02') return '刘护士长'
  return '陈工'
}

// ── 入院自动生成任务 ──────────────────────────────────

let autoSeq = 0

export function generateAdmitTasks(
  patientId: string,
  pname: string,
  bedId: string,
  wardId: string,
  wardType: WardType,
  admissionType: AdmissionType,
): MonitorTask[] {
  const tasks: MonitorTask[] = []
  const isICU = wardType === 'icu'
  const assignee = defaultAssignee(wardId)

  function mk(type: TaskType, at: Date, who: string): MonitorTask {
    const deadline = new Date(at)
    deadline.setMinutes(deadline.getMinutes() + 30)
    return {
      id: `TASK-AUTO-${Date.now()}-${++autoSeq}`,
      type,
      patientId,
      patientName: pname,
      bedId,
      wardId,
      scheduledAt: fmtTime(at),
      deadline: fmtTime(deadline),
      assigneeName: who,
      shift: currentShift(at.getHours()),
      status: 'pending',
      source: 'auto',
      createdAt: fmtTime(NOW),
    }
  }

  // 入科评估（即时）
  tasks.push(mk('assess', NOW, isICU ? '张主任' : assignee))

  // 急诊入院 → 30 分钟内医生评估
  if (admissionType === 'emergency') {
    const t = new Date(NOW)
    t.setMinutes(t.getMinutes() + 30)
    tasks.push(mk('assess', t, '张主任'))
  }

  // 巡视
  const roundInterval = isICU ? 1 : 4
  const roundCount = isICU ? 8 : 2
  for (let i = 0; i < roundCount; i++) {
    const t = new Date(NOW)
    t.setHours(t.getHours() + i * roundInterval)
    tasks.push(mk('round', t, assignee))
  }

  // 翻身（ICU 限定）
  if (isICU) {
    for (let i = 0; i < 4; i++) {
      const t = new Date(NOW)
      t.setHours(t.getHours() + i * 2)
      tasks.push(mk('turn', t, assignee))
    }
  }

  // 体征记录
  const vitalInterval = isICU ? 1 : 4
  const vitalCount = isICU ? 8 : 2
  for (let i = 0; i < vitalCount; i++) {
    const t = new Date(NOW)
    t.setHours(t.getHours() + i * vitalInterval)
    tasks.push(mk('vital', t, assignee))
  }

  return tasks
}

// ── 设备绑定自动生成任务 ──────────────────────────────

export function generateDeviceBindTasks(
  patientId: string,
  pname: string,
  bedId: string,
  wardId: string,
): MonitorTask[] {
  const tasks: MonitorTask[] = []
  const assignee = defaultAssignee(wardId)

  // 设备信号确认（即时）
  tasks.push({
    id: `TASK-AUTO-${Date.now()}-${++autoSeq}`,
    type: 'device_check',
    patientId,
    patientName: pname,
    bedId,
    wardId,
    scheduledAt: fmtTime(NOW),
    deadline: fmtTime(new Date(NOW.getTime() + 15 * 60 * 1000)),
    assigneeName: assignee,
    shift: currentShift(NOW.getHours()),
    status: 'pending',
    source: 'auto',
    createdAt: fmtTime(NOW),
  })

  return tasks
}

// ── 种子任务数据 ──────────────────────────────────────

function seed(
  id: string,
  type: TaskType,
  bedId: string,
  wardId: string,
  scheduledAt: string,
  assigneeName: string,
  status: TaskStatus,
  opts?: { completedAt?: string; completedBy?: string; result?: string; source?: TaskSource },
): MonitorTask {
  const bed = BEDS.find((b) => b.id === bedId)!
  const pid = bed.patientId!
  const [date, time] = scheduledAt.split(' ')
  const [h] = time.split(':').map(Number)
  return {
    id,
    type,
    patientId: pid,
    patientName: patientName(pid),
    bedId,
    wardId,
    scheduledAt,
    deadline: `${date} ${String(h + 1).padStart(2, '0')}:00`,
    assigneeName,
    shift: currentShift(h),
    status,
    completedAt: opts?.completedAt,
    completedBy: opts?.completedBy,
    result: opts?.result,
    source: opts?.source ?? 'auto',
    createdAt: '2026-07-18 08:00',
  }
}

export const SEED_TASKS: MonitorTask[] = [
  // ICU-A · W01-01 · 张伟
  seed('T-001', 'round', 'W01-01', 'W01', '2026-07-18 08:00', '王芳', 'done', { completedAt: '2026-07-18 08:05', completedBy: '王芳', result: '患者安静休息，生命体征平稳' }),
  seed('T-002', 'round', 'W01-01', 'W01', '2026-07-18 09:00', '王芳', 'done', { completedAt: '2026-07-18 09:03', completedBy: '王芳', result: '意识清醒，诉胸闷较前缓解' }),
  seed('T-003', 'round', 'W01-01', 'W01', '2026-07-18 10:00', '王芳', 'pending'),
  seed('T-004', 'vital', 'W01-01', 'W01', '2026-07-18 08:00', '王芳', 'done', { completedAt: '2026-07-18 08:10', completedBy: '王芳', result: 'HR 72, BP 128/82, SpO₂ 97%, T 36.7℃' }),
  seed('T-005', 'vital', 'W01-01', 'W01', '2026-07-18 09:00', '王芳', 'done', { completedAt: '2026-07-18 09:08', completedBy: '王芳', result: 'HR 75, BP 125/80, SpO₂ 98%, T 36.8℃' }),
  seed('T-006', 'vital', 'W01-01', 'W01', '2026-07-18 10:00', '王芳', 'pending'),
  seed('T-007', 'assess', 'W01-01', 'W01', '2026-07-18 07:30', '张主任', 'done', { completedAt: '2026-07-18 07:45', completedBy: '张主任', result: '急性心梗入科评估完成，已下达监护医嘱' }),

  // ICU-A · W01-02 · 李秀英
  seed('T-008', 'round', 'W01-02', 'W01', '2026-07-18 08:00', '王芳', 'done', { completedAt: '2026-07-18 08:07', completedBy: '王芳', result: '糖尿病患者，血糖监测已执行' }),
  seed('T-009', 'round', 'W01-02', 'W01', '2026-07-18 09:00', '王芳', 'done', { completedAt: '2026-07-18 09:05', completedBy: '王芳', result: '一般情况可' }),
  seed('T-010', 'round', 'W01-02', 'W01', '2026-07-18 10:00', '王芳', 'pending'),

  // ICU-A · W01-03 · 王强
  seed('T-011', 'round', 'W01-03', 'W01', '2026-07-18 08:00', '王芳', 'done', { completedAt: '2026-07-18 08:12', completedBy: '王芳', result: '冠心病复查，无不适主诉' }),
  seed('T-012', 'round', 'W01-03', 'W01', '2026-07-18 07:00', '王芳', 'overdue'),

  // ICU-A · W01-04 · 刘敏
  seed('T-013', 'round', 'W01-04', 'W01', '2026-07-18 08:00', '王芳', 'done', { completedAt: '2026-07-18 08:15', completedBy: '王芳', result: '心律失常，心电监护中' }),
  seed('T-014', 'round', 'W01-04', 'W01', '2026-07-18 10:00', '王芳', 'pending'),
  seed('T-015', 'turn', 'W01-04', 'W01', '2026-07-18 08:00', '王芳', 'done', { completedAt: '2026-07-18 08:20', completedBy: '王芳', result: '左侧卧位，皮肤完整无压疮' }),
  seed('T-016', 'turn', 'W01-04', 'W01', '2026-07-18 10:00', '王芳', 'pending'),

  // ICU-A · W01-05 · 陈杰
  seed('T-017', 'round', 'W01-05', 'W01', '2026-07-18 08:00', '王芳', 'done', { completedAt: '2026-07-18 08:18', completedBy: '王芳', result: '慢阻肺患者，呼吸平稳' }),
  seed('T-018', 'round', 'W01-05', 'W01', '2026-07-18 09:00', '王芳', 'done', { completedAt: '2026-07-18 09:10', completedBy: '王芳', result: 'SpO₂ 97%，无气促' }),
  seed('T-019', 'round', 'W01-05', 'W01', '2026-07-18 10:00', '王芳', 'pending'),
  seed('T-020', 'turn', 'W01-05', 'W01', '2026-07-18 07:00', '王芳', 'overdue'),

  // ICU-B · W02-01 · 赵丽
  seed('T-021', 'round', 'W02-01', 'W02', '2026-07-18 08:00', '刘护士长', 'done', { completedAt: '2026-07-18 08:08', completedBy: '刘护士长', result: '高血压急症，血压控制中' }),
  seed('T-022', 'round', 'W02-01', 'W02', '2026-07-18 10:00', '刘护士长', 'pending'),

  // ICU-B · W02-02 · 孙浩
  seed('T-023', 'round', 'W02-02', 'W02', '2026-07-18 08:00', '刘护士长', 'done', { completedAt: '2026-07-18 08:11', completedBy: '刘护士长', result: '房颤患者，心率监测中' }),
  seed('T-024', 'round', 'W02-02', 'W02', '2026-07-18 07:00', '刘护士长', 'overdue'),

  // ICU-B · W02-04 · 周芳
  seed('T-025', 'round', 'W02-04', 'W02', '2026-07-18 08:00', '刘护士长', 'done', { completedAt: '2026-07-18 08:14', completedBy: '刘护士长', result: '贫血查因，输血准备中' }),
  seed('T-026', 'round', 'W02-04', 'W02', '2026-07-18 10:00', '刘护士长', 'pending'),
  seed('T-027', 'intake', 'W02-04', 'W02', '2026-07-18 08:00', '刘护士长', 'done', { completedAt: '2026-07-18 08:30', completedBy: '刘护士长', result: '入量 500ml，出量 300ml' }),

  // 普通病房 · W03-01 · 吴敏
  seed('T-028', 'round', 'W03-01', 'W03', '2026-07-18 08:00', '陈工', 'done', { completedAt: '2026-07-18 08:20', completedBy: '陈工', result: '上呼吸道感染，体温正常' }),
  seed('T-029', 'round', 'W03-01', 'W03', '2026-07-18 12:00', '陈工', 'pending'),
  seed('T-030', 'vital', 'W03-01', 'W03', '2026-07-18 08:00', '陈工', 'done', { completedAt: '2026-07-18 08:25', completedBy: '陈工', result: 'HR 78, T 36.6℃' }),

  // 普通病房 · W03-03 · 郑国
  seed('T-031', 'round', 'W03-03', 'W03', '2026-07-18 08:00', '陈工', 'done', { completedAt: '2026-07-18 08:22', completedBy: '陈工', result: '脑梗康复，肢体功能锻炼指导' }),
  seed('T-032', 'round', 'W03-03', 'W03', '2026-07-18 12:00', '陈工', 'pending'),
  seed('T-033', 'handover', 'W03-03', 'W03', '2026-07-18 16:00', '陈工', 'pending'),
]
