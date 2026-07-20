'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  type RoleCode,
  findUser,
  findUserByUsername,
  ROLE_CODE_LABEL,
  isGlobalRole,
} from '@/lib/admin-data'

export { ROLE_CODE_LABEL, isGlobalRole }
export type { RoleCode }

// 当前登录身份：角色 + 负责病区共同决定可见的告警范围
export interface AuthUser {
  id: number
  name: string
  role: RoleCode
  wardIds: string[]
}

interface AuthState {
  user: AuthUser
  userId: number
  role: RoleCode
  name: string
  wardIds: string[]
  login: (user: AuthUser) => void
  setUser: (user: AuthUser) => void
  logout: () => void
}

const DEFAULT_USER: AuthUser = { id: 1, name: '超级管理员', role: 'SUPER_ADMIN', wardIds: [] }

const AuthContext = createContext<AuthState | null>(null)

function persist(u: AuthUser) {
  if (typeof document !== 'undefined') {
    document.cookie = `auth=1; path=/; max-age=86400`
    document.cookie = `role=${u.role}; path=/; max-age=86400`
    document.cookie = `uid=${u.id}; path=/; max-age=86400`
  }
}

function clearCookies() {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth=; path=/; max-age=0'
    document.cookie = 'role=; path=/; max-age=0'
    document.cookie = 'uid=; path=/; max-age=0'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser>(DEFAULT_USER)

  function apply(u: AuthUser) {
    setUserState(u)
    persist(u)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user.id,
        role: user.role,
        name: user.name,
        wardIds: user.wardIds,
        login: apply,
        setUser: apply,
        logout: () => {
          setUserState(DEFAULT_USER)
          clearCookies()
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}

// ── 演示用 helper：把 USERS 记录映射为登录身份 ──────────────────
export function toAuthUser(id: number): AuthUser {
  const u = findUser(id)
  if (!u) return DEFAULT_USER
  return {
    id: u.id,
    name: u.name,
    role: (u.roles[0] as RoleCode) ?? 'NURSE',
    wardIds: u.wardIds,
  }
}

export function toAuthUserByUsername(username: string): AuthUser {
  const u = findUserByUsername(username.trim().toLowerCase())
  if (!u) return DEFAULT_USER
  return {
    id: u.id,
    name: u.name,
    role: (u.roles[0] as RoleCode) ?? 'NURSE',
    wardIds: u.wardIds,
  }
}
