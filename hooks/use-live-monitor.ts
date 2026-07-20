'use client'

import { useMemo } from 'react'
import { useStore, type LiveAlarm, type LiveVital } from '@/lib/store'
import { useAuth, isGlobalRole } from '@/lib/auth'
import { WARDS, BEDS } from '@/lib/ward-data'

export type { LiveAlarm, LiveVital }

/**
 * 实时监护视图层：从全局 store 读取单一数据源，按当前登录用户的
 * 「角色 + 负责病区」过滤后返回可见的 vitals / history / alarms。
 *
 * 过滤规则：
 * 1. 病区过滤 —— 全局角色（SUPER_ADMIN / TENANT_ADMIN / AUDITOR）可见全部开启病区；
 *    其余角色仅可见自身 wardIds 对应病区的床位与告警。
 * 2. 角色过滤 —— 全局角色不受规则 notifyRoles 限制；病区角色仅接收
 *    notifyRoles 为空或包含自身角色的告警。
 */
export function useLiveMonitor() {
  const { vitals, history, alarms, acknowledge, acknowledgeAll } = useStore()
  const { role, wardIds } = useAuth()
  const isGlobal = isGlobalRole(role)

  const visibleWardIds = useMemo(
    () => (isGlobal ? new Set(WARDS.filter((w) => w.status === 'open').map((w) => w.id)) : new Set(wardIds)),
    [isGlobal, wardIds],
  )

  const visibleVitals = useMemo(() => {
    const out: Record<string, LiveVital[]> = {}
    for (const [bedId, v] of Object.entries(vitals)) {
      const bed = BEDS.find((b) => b.id === bedId)
      if (!bed || (!isGlobal && !visibleWardIds.has(bed.wardId))) continue
      out[bedId] = v
    }
    return out
  }, [vitals, visibleWardIds, isGlobal])

  const visibleHistory = useMemo(() => {
    const out: Record<string, number[]> = {}
    for (const [bedId, h] of Object.entries(history)) {
      const bed = BEDS.find((b) => b.id === bedId)
      if (!bed || (!isGlobal && !visibleWardIds.has(bed.wardId))) continue
      out[bedId] = h
    }
    return out
  }, [history, visibleWardIds, isGlobal])

  const visibleAlarms = useMemo(() => {
    return alarms.filter((a) => {
      if (!isGlobal && !visibleWardIds.has(a.wardId)) return false
      if (!isGlobal && a.ruleNotifyRoles && a.ruleNotifyRoles.length > 0 && !a.ruleNotifyRoles.includes(role)) return false
      return true
    })
  }, [alarms, visibleWardIds, isGlobal, role])

  const pendingAlarms = visibleAlarms.filter((a) => !a.acknowledged)
  const criticalCount = pendingAlarms.filter((a) => a.level === 'critical').length

  return {
    vitals: visibleVitals,
    history: visibleHistory,
    alarms: visibleAlarms,
    pendingAlarms,
    criticalCount,
    acknowledge,
    acknowledgeAll,
  }
}
