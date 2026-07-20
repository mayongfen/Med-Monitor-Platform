'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { ADMISSIONS, PATIENTS, patientName, type Admission, type Patient, type Outcome } from '@/lib/patient-data'
import { BEDS, WARDS, wardName, type Bed, type BedStatus } from '@/lib/ward-data'
import { DEVICES_LIFECYCLE, MAINTAIN_LOGS, type Device, type DeviceStatus, type MaintainLog } from '@/lib/device-data'
import { ALARM_RULES, OP_LABEL, type AlarmRule, type AlarmOperator } from '@/lib/alarm-rule-data'
import { VITAL_CONFIGS, type VitalKey } from '@/lib/monitor-types'
import { SEED_TASKS, generateAdmitTasks, generateDeviceBindTasks, type MonitorTask } from '@/lib/monitor-task-data'

type NewAdmission = Omit<Admission, 'serialNo' | 'status'> & { serialNo?: string }

// ── 实时监护类型（全局单源，供 useLiveMonitor 视图层过滤消费）──
export interface LiveVital {
  key: VitalKey
  value: number
  valid: boolean
}

export interface LiveAlarm {
  id: string
  ruleId: string
  ruleName: string
  // 规则配置的通知角色快照：为空表示对所有可见角色生效
  ruleNotifyRoles?: string[]
  bedId: string
  wardId: string
  patientId: string
  patientName: string
  wardName: string
  type: string
  metric: string
  op: AlarmOperator
  value: number
  measured: number
  unit: string
  level: 'warning' | 'critical'
  message: string
  raisedAt: string
  acknowledged: boolean
}

const MAX_HISTORY = 60

function baseline(hr: number) {
  return {
    heartRate: 68 + (hr % 20),
    respiration: 14 + (hr % 6),
    spo2: 97 - (hr % 3),
    temperature: 36.6 + (hr % 8) / 10,
  }
}

function clamp(key: VitalKey, v: number): number {
  if (key === 'spo2') return Math.min(100, Math.max(80, v))
  if (key === 'temperature') return Math.min(41, Math.max(35, v))
  if (key === 'heartRate') return Math.min(180, Math.max(35, v))
  return Math.min(40, Math.max(6, v))
}

function tick(base: Record<VitalKey, number>, key: VitalKey): number {
  const step = key === 'temperature' ? (Math.random() - 0.5) * 0.2 : (Math.random() - 0.5) * (key === 'heartRate' ? 8 : 3)
  const next = clamp(key, base[key] + step)
  base[key] = next
  return next
}

function evalRule(rule: AlarmRule, measured: number): boolean {
  switch (rule.op) {
    case 'lt': return measured < rule.value
    case 'gt': return measured > rule.value
    case 'lte': return measured <= rule.value
    case 'gte': return measured >= rule.value
  }
}

function findRule(rules: AlarmRule[], type: string, measured: number, level: 'warning' | 'critical'): AlarmRule | null {
  return rules.find((r) => r.enabled && r.type === type && r.level === level && evalRule(r, measured)) ?? null
}

interface Store {
  // 患者
  patients: Patient[]
  addPatient: (p: Omit<Patient, 'id'>) => Patient
  // 入院
  admissions: Admission[]
  admit: (a: NewAdmission) => void
  discharge: (admissionNo: string, outAt: string, outcome: Outcome) => void
  // 床位
  beds: Bed[]
  setBedStatus: (bedId: string, status: BedStatus) => void
  assignBed: (bedId: string, patientId: string, deviceId?: string) => void
  unassignBed: (bedId: string, toStatus?: BedStatus) => void
  // 设备
  devices: Device[]
  bindDevice: (deviceId: string, bedId: string) => void
  unbindDevice: (deviceId: string) => void
  scrapDevice: (deviceId: string) => void
  addDevice: (d: Omit<Device, 'id' | 'maintainCount'>) => void
  // 规则
  rules: AlarmRule[]
  upsertRule: (r: AlarmRule) => void
  toggleRule: (id: string) => void
  removeRule: (id: string) => void
  // 实时监护（全局单源，所有组件共享同一份模拟数据）
  vitals: Record<string, LiveVital[]>
  history: Record<string, number[]>
  alarms: LiveAlarm[]
  acknowledge: (id: string) => void
  acknowledgeAll: () => void
  // 监护任务
  tasks: MonitorTask[]
  addTask: (t: Omit<MonitorTask, 'id' | 'createdAt' | 'status'>) => void
  completeTask: (id: string, result: string, completedBy: string) => void
  cancelTask: (id: string, reason: string) => void
}

const Ctx = createContext<Store | null>(null)

let pid = 100
let did = 100

export function StoreProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(PATIENTS)
  const [admissions, setAdmissions] = useState<Admission[]>(ADMISSIONS)
  const [beds, setBeds] = useState<Bed[]>(BEDS)
  const [devices, setDevices] = useState<Device[]>(DEVICES_LIFECYCLE)
  const [rules, setRules] = useState<AlarmRule[]>(ALARM_RULES)
  const [tasks, setTasks] = useState<MonitorTask[]>(SEED_TASKS)

  // 实时监护全局状态
  const [vitals, setVitals] = useState<Record<string, LiveVital[]>>({})
  const [history, setHistory] = useState<Record<string, number[]>>({})
  const [alarms, setAlarms] = useState<LiveAlarm[]>([])

  const baseRef = useRef<Record<string, Record<VitalKey, number>>>({})
  const historyRef = useRef<Record<string, number[]>>({})
  const alarmsRef = useRef<LiveAlarm[]>([])

  // ref 与 state 同步，供定时器读取最新值，避免闭包陈旧
  useEffect(() => { historyRef.current = history }, [history])
  useEffect(() => { alarmsRef.current = alarms }, [alarms])

  useEffect(() => {
    const occupiedBeds = beds.filter((b) => b.status === 'occupied' && b.patientId)
    occupiedBeds.forEach((b, i) => {
      baseRef.current[b.id] = baseline(i + 1)
    })

    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false })
      const newVitals: Record<string, LiveVital[]> = {}
      const newAlarms: LiveAlarm[] = []
      let histChanged = false
      const newHistory = { ...historyRef.current }

      occupiedBeds.forEach((b) => {
        const base = baseRef.current[b.id]
        if (!base) return
        const bedVitals: LiveVital[] = VITAL_CONFIGS.map((c) => {
          const invalid = Math.random() < 0.01
          const value = invalid ? 0 : tick(base, c.key)
          return { key: c.key, value, valid: !invalid }
        })
        newVitals[b.id] = bedVitals

        const hr = bedVitals.find((v) => v.key === 'heartRate')
        if (hr?.valid) {
          newHistory[b.id] = [...(newHistory[b.id] ?? []), hr.value].slice(-MAX_HISTORY)
          histChanged = true
        }

        // 告警检测：同一床位同一规则未确认时不重复生成
        bedVitals.forEach((v) => {
          if (!v.valid) return
          const typeMap: Record<VitalKey, string> = { heartRate: 'heart', respiration: 'breath', spo2: 'spo2', temperature: 'temperature' }
          const rtype = typeMap[v.key]
          const critical = findRule(rules, rtype, v.value, 'critical')
          const warning = findRule(rules, rtype, v.value, 'warning')
          const hit = critical ?? warning
          if (hit) {
            const exist = alarmsRef.current.some((a) => a.bedId === b.id && a.ruleId === hit.id && !a.acknowledged)
            if (!exist && Math.random() < 0.15) {
              newAlarms.push({
                id: `LA-${b.id}-${hit.id}-${now.getTime()}`,
                ruleId: hit.id,
                ruleName: hit.name,
                ruleNotifyRoles: hit.notifyRoles,
                bedId: b.id,
                wardId: b.wardId,
                patientId: b.patientId!,
                patientName: patientName(b.patientId),
                wardName: wardName(b.wardId),
                type: rtype,
                metric: hit.metric,
                op: hit.op,
                value: hit.value,
                measured: v.value,
                unit: hit.unit,
                level: hit.level,
                message: `${hit.metric} ${OP_LABEL[hit.op]} ${hit.value}${hit.unit}，实测 ${v.value.toFixed(0)}${hit.unit}`,
                raisedAt: timeStr,
                acknowledged: false,
              })
            }
          }
        })
      })

      setVitals(newVitals)
      if (histChanged) {
        historyRef.current = newHistory
        setHistory(newHistory)
      }
      if (newAlarms.length) {
        setAlarms((prev) => [...newAlarms, ...prev].slice(0, 50))
      }
    }, 2000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beds.length, rules])

  const store: Store = {
    patients,
    addPatient: (p) => {
      const np = { ...p, id: `P${String(++pid).padStart(3, '0')}` }
      setPatients((prev) => [...prev, np])
      return np
    },
    admissions,
    admit: (a) => {
      setAdmissions((prev) => [
        { ...a, serialNo: a.serialNo || `S-${Date.now()}`, status: 'admitted' },
        ...prev,
      ])
      // 床位占用 + 设备绑定
      if (a.bedId) {
        setBeds((prev) => prev.map((b) => (b.id === a.bedId ? { ...b, status: 'occupied', patientId: a.patientId, deviceId: a.deviceId ?? b.deviceId } : b)))
      }
      if (a.deviceId) {
        setDevices((prev) => prev.map((d) => (d.id === a.deviceId ? { ...d, status: 'in_use', bedId: a.bedId } : d)))
      }
      // 自动生成监护任务：根据病区类型 + 入院类型
      if (a.bedId) {
        const bed = beds.find((b) => b.id === a.bedId)
        const ward = WARDS.find((w) => w.id === bed?.wardId)
        if (ward) {
          const newTasks = generateAdmitTasks(
            a.patientId,
            patientName(a.patientId),
            a.bedId,
            ward.id,
            ward.type,
            a.type,
          )
          setTasks((prev) => [...newTasks, ...prev])
        }
      }
    },
    discharge: (admissionNo, outAt, outcome) => {
      setAdmissions((prev) =>
        prev.map((a) =>
          a.admissionNo === admissionNo
            ? { ...a, status: 'discharged', outAt, outcome, archivedAt: outAt }
            : a,
        ),
      )
      // 找到该入院记录，解绑床位和设备
      const adm = admissions.find((a) => a.admissionNo === admissionNo)
      if (adm?.bedId) {
        setBeds((prev) => prev.map((b) => (b.id === adm.bedId ? { ...b, status: 'disinfect', patientId: undefined, deviceId: undefined } : b)))
      }
      if (adm?.deviceId) {
        setDevices((prev) => prev.map((d) => (d.id === adm.deviceId ? { ...d, status: 'standby', bedId: undefined } : d)))
      }
      // 终止该患者所有未完成的监护任务
      if (adm?.patientId) {
        setTasks((prev) => prev.map((t) =>
          t.patientId === adm.patientId && (t.status === 'pending' || t.status === 'doing')
            ? { ...t, status: 'cancelled', cancelReason: '患者出院' }
            : t,
        ))
      }
    },
    beds,
    setBedStatus: (bedId, status) => setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, status } : b))),
    assignBed: (bedId, patientId, deviceId) =>
      setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, status: 'occupied', patientId, deviceId: deviceId ?? b.deviceId } : b))),
    unassignBed: (bedId, toStatus = 'idle') =>
      setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, status: toStatus, patientId: undefined, deviceId: undefined } : b))),
    devices,
    bindDevice: (deviceId, bedId) => {
      setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, status: 'in_use', bedId } : d)))
      const bed = beds.find((b) => b.id === bedId)
      setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, deviceId } : b)))
      // 对已占用床位生成设备检查任务
      if (bed?.status === 'occupied' && bed.patientId) {
        const ward = WARDS.find((w) => w.id === bed.wardId)
        if (ward) {
          const newTasks = generateDeviceBindTasks(
            bed.patientId,
            patientName(bed.patientId),
            bedId,
            ward.id,
          )
          setTasks((prev) => [...newTasks, ...prev])
        }
      }
    },
    unbindDevice: (deviceId) => {
      // 找到设备绑定的床位，取消该床位未执行的设备类任务
      const dev = devices.find((d) => d.id === deviceId)
      if (dev?.bedId) {
        setTasks((prev) => prev.map((t) =>
          t.bedId === dev.bedId && t.type === 'device_check' && (t.status === 'pending' || t.status === 'doing')
            ? { ...t, status: 'cancelled', cancelReason: '设备已解绑' }
            : t,
        ))
      }
      setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, status: 'standby', bedId: undefined } : d)))
      setBeds((prev) => prev.map((b) => (b.deviceId === deviceId ? { ...b, deviceId: undefined } : b)))
    },
    scrapDevice: (deviceId) =>
      setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, status: 'scrapped' } : d))),
    addDevice: (d) => {
      const nd = { ...d, id: `D${String(++did).padStart(3, '0')}`, maintainCount: 0 }
      setDevices((prev) => [...prev, nd])
    },
    rules,
    upsertRule: (r) =>
      setRules((prev) => {
        const idx = prev.findIndex((x) => x.id === r.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = r
          return next
        }
        return [...prev, r]
      }),
    toggleRule: (id) => setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))),
    removeRule: (id) => setRules((prev) => prev.filter((r) => r.id !== id)),
    vitals,
    history,
    alarms,
    acknowledge: (id) => setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))),
    acknowledgeAll: () => setAlarms((prev) => prev.map((a) => ({ ...a, acknowledged: true }))),
    tasks,
    addTask: (t) => {
      const now = new Date()
      const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const nt: MonitorTask = {
        ...t,
        id: `TASK-MANUAL-${Date.now()}`,
        status: 'pending',
        createdAt: ts,
      }
      setTasks((prev) => [nt, ...prev])
    },
    completeTask: (id, result, completedBy) => {
      const now = new Date()
      const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      setTasks((prev) => prev.map((t) =>
        t.id === id ? { ...t, status: 'done', result, completedAt: ts, completedBy } : t,
      ))
    },
    cancelTask: (id, reason) => {
      setTasks((prev) => prev.map((t) =>
        t.id === id ? { ...t, status: 'cancelled', cancelReason: reason } : t,
      ))
    },
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore 必须在 StoreProvider 内使用')
  return ctx
}
