'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { ADMISSIONS, PATIENTS, type Admission, type Patient, type Outcome } from '@/lib/patient-data'
import { BEDS, WARDS, type Bed, type BedStatus } from '@/lib/ward-data'
import { DEVICES_LIFECYCLE, MAINTAIN_LOGS, type Device, type DeviceStatus, type MaintainLog } from '@/lib/device-data'
import { ALARM_RULES, type AlarmRule } from '@/lib/alarm-rule-data'

type NewAdmission = Omit<Admission, 'serialNo' | 'status'> & { serialNo?: string }

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
      setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, deviceId } : b)))
    },
    unbindDevice: (deviceId) => {
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
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore 必须在 StoreProvider 内使用')
  return ctx
}
