'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEVICES,
  VITAL_CONFIGS,
  type DeviceStatus,
  type TrendPoint,
  type VitalKey,
  type Vitals,
} from '@/lib/monitor-types'

const MAX_HISTORY = 30

// 预设的传感器未佩戴 / 离线情况，用于演示无效数据表现
const INVALID_PRESET: Record<string, VitalKey[] | 'offline'> = {
  'BED-03': ['spo2'],
  'BED-05': ['respiration'],
  'BED-08': 'offline',
}

interface DeviceRuntime {
  vitals: Vitals
  history: TrendPoint[]
  status: DeviceStatus
}

export interface Alarm {
  id: string
  deviceId: string
  deviceName: string
  bed: string
  vital: string
  level: 'warning' | 'critical'
  message: string
  time: string
}

const baseline: Record<string, Record<VitalKey, number>> = {}
for (const d of DEVICES) {
  baseline[d.id] = {
    heartRate: 68 + Math.round(Math.random() * 40),
    respiration: 13 + Math.round(Math.random() * 8),
    spo2: 94 + Math.round(Math.random() * 5),
    temperature: 36.4 + Math.random() * 1.2,
  }
}

function clampRange(key: VitalKey, v: number) {
  if (key === 'spo2') return Math.min(100, Math.max(80, v))
  if (key === 'temperature') return Math.min(41, Math.max(35, v))
  if (key === 'heartRate') return Math.min(180, Math.max(35, v))
  return Math.min(40, Math.max(6, v))
}

function statusForVital(key: VitalKey, v: number): 'normal' | 'warning' | 'critical' {
  const cfg = VITAL_CONFIGS.find((c) => c.key === key)!
  const [lo, hi] = cfg.normal
  if (key === 'spo2') {
    if (v < 90) return 'critical'
    if (v < lo) return 'warning'
    return 'normal'
  }
  if (key === 'heartRate') {
    if (v < 45 || v > 130) return 'critical'
    if (v < lo || v > hi) return 'warning'
    return 'normal'
  }
  if (key === 'temperature') {
    if (v >= 39 || v < 35.5) return 'critical'
    if (v > hi || v < lo) return 'warning'
    return 'normal'
  }
  if (v < 8 || v > 28) return 'critical'
  if (v < lo || v > hi) return 'warning'
  return 'normal'
}

function tickVital(id: string, key: VitalKey): number {
  const step =
    key === 'temperature' ? (Math.random() - 0.5) * 0.15 : (Math.random() - 0.5) * (key === 'heartRate' ? 6 : 2)
  const next = clampRange(key, baseline[id][key] + step)
  baseline[id][key] = next
  return next
}

function isInvalid(id: string, key: VitalKey): boolean {
  const preset = INVALID_PRESET[id]
  if (preset === 'offline') return true
  if (Array.isArray(preset) && preset.includes(key)) return true
  // 少量随机抖动，模拟传感器偶发脱落
  return Math.random() < 0.015
}

function buildTime(d: Date) {
  return d.toLocaleTimeString('zh-CN', { hour12: false })
}

export function useMonitorData() {
  const stateRef = useRef<Record<string, DeviceRuntime>>({})
  const [snapshot, setSnapshot] = useState<Record<string, DeviceRuntime>>({})
  const [alarms, setAlarms] = useState<Alarm[]>([])

  useEffect(() => {
    // 初始化
    const init: Record<string, DeviceRuntime> = {}
    for (const d of DEVICES) {
      const vitals = {} as Vitals
      for (const cfg of VITAL_CONFIGS) {
        vitals[cfg.key] = { value: baseline[d.id][cfg.key], valid: INVALID_PRESET[d.id] !== 'offline' }
      }
      init[d.id] = { vitals, history: [], status: 'normal' }
    }
    stateRef.current = init

    const interval = setInterval(() => {
      const now = new Date()
      const time = buildTime(now)
      const next: Record<string, DeviceRuntime> = {}
      const newAlarms: Alarm[] = []

      for (const d of DEVICES) {
        const vitals = {} as Vitals
        let worst: DeviceStatus = 'normal'
        let validCount = 0

        for (const cfg of VITAL_CONFIGS) {
          const invalid = isInvalid(d.id, cfg.key)
          const value = tickVital(d.id, cfg.key)
          vitals[cfg.key] = { value, valid: !invalid }
          if (!invalid) {
            validCount++
            const s = statusForVital(cfg.key, value)
            if (s === 'critical') worst = 'critical'
            else if (s === 'warning' && worst !== 'critical') worst = 'warning'
            if (s !== 'normal') {
              newAlarms.push({
                id: `${d.id}-${cfg.key}-${now.getTime()}`,
                deviceId: d.id,
                deviceName: d.name,
                bed: d.bed,
                vital: cfg.label,
                level: s,
                message: `${cfg.label} ${value.toFixed(cfg.decimals)}${cfg.unit} ${
                  s === 'critical' ? '超出危急阈值' : '偏离正常范围'
                }`,
                time,
              })
            }
          }
        }

        const status: DeviceStatus = validCount === 0 ? 'offline' : worst
        const prev = stateRef.current[d.id]
        const point: TrendPoint = {
          t: now.getTime(),
          time,
          heartRate: vitals.heartRate.valid ? Math.round(vitals.heartRate.value) : null,
          respiration: vitals.respiration.valid ? Math.round(vitals.respiration.value) : null,
          spo2: vitals.spo2.valid ? Math.round(vitals.spo2.value) : null,
          temperature: vitals.temperature.valid ? Number(vitals.temperature.value.toFixed(1)) : null,
        }
        const history = [...(prev?.history ?? []), point].slice(-MAX_HISTORY)
        next[d.id] = { vitals, history, status }
      }

      stateRef.current = next
      setSnapshot(next)
      if (newAlarms.length) {
        setAlarms((prev) => [...newAlarms, ...prev].slice(0, 40))
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return { snapshot, alarms }
}
