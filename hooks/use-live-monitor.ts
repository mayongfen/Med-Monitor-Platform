'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { VITAL_CONFIGS, type VitalKey } from '@/lib/monitor-types'
import { patientName } from '@/lib/patient-data'
import { wardName } from '@/lib/ward-data'
import type { AlarmRule, AlarmOperator } from '@/lib/alarm-rule-data'
import { OP_LABEL } from '@/lib/alarm-rule-data'

export interface LiveVital {
  key: VitalKey
  value: number
  valid: boolean
}

export interface LiveAlarm {
  id: string
  ruleId: string
  ruleName: string
  bedId: string
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

export function useLiveMonitor() {
  const { beds, rules } = useStore()
  const occupiedBeds = beds.filter((b) => b.status === 'occupied' && b.patientId)

  const [vitals, setVitals] = useState<Record<string, LiveVital[]>>({})
  const [alarms, setAlarms] = useState<LiveAlarm[]>([])
  const [history, setHistory] = useState<Record<string, number[]>>({})
  const baseRef = useRef<Record<string, Record<VitalKey, number>>>({})

  useEffect(() => {
    occupiedBeds.forEach((b, i) => {
      baseRef.current[b.id] = baseline(i + 1)
    })
    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false })
      const newVitals: Record<string, LiveVital[]> = {}
      const newHistory = { ...history }

      occupiedBeds.forEach((b) => {
        const base = baseRef.current[b.id]
        if (!base) return
        const bedVitals: LiveVital[] = VITAL_CONFIGS.map((c) => {
          const invalid = Math.random() < 0.01
          const value = invalid ? 0 : tick(base, c.key)
          return { key: c.key, value, valid: !invalid }
        })
        newVitals[b.id] = bedVitals

        // 历史
        const hr = bedVitals.find((v) => v.key === 'heartRate')
        if (hr?.valid) {
          const arr = [...(newHistory[b.id] ?? []), hr.value].slice(-MAX_HISTORY)
          newHistory[b.id] = arr
        }

        // 告警检测
        bedVitals.forEach((v) => {
          if (!v.valid) return
          const typeMap: Record<VitalKey, string> = { heartRate: 'heart', respiration: 'breath', spo2: 'spo2', temperature: 'temperature' }
          const rtype = typeMap[v.key]
          const critical = findRule(rules, rtype, v.value, 'critical')
          const warning = findRule(rules, rtype, v.value, 'warning')
          const hit = critical ?? warning
          if (hit) {
            const exist = alarms.some((a) => a.bedId === b.id && a.ruleId === hit.id && a.acknowledged === false)
            if (!exist && Math.random() < 0.15) {
              const alm: LiveAlarm = {
                id: `LA-${b.id}-${hit.id}-${now.getTime()}`,
                ruleId: hit.id,
                ruleName: hit.name,
                bedId: b.id,
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
              }
              setAlarms((prev) => [alm, ...prev].slice(0, 50))
            }
          }
        })
      })

      setVitals(newVitals)
      setHistory(newHistory)
    }, 2000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beds.length, rules])

  function acknowledge(id: string) {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)))
  }
  function acknowledgeAll() {
    setAlarms((prev) => prev.map((a) => ({ ...a, acknowledged: true })))
  }

  const pendingAlarms = alarms.filter((a) => !a.acknowledged)
  const criticalCount = pendingAlarms.filter((a) => a.level === 'critical').length

  return { vitals, alarms, pendingAlarms, criticalCount, history, acknowledge, acknowledgeAll }
}
