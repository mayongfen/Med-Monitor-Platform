'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Role } from '@/lib/admin-data'

export const ROLE_OPTIONS: { code: Role; name: string }[] = [
  { code: 'SUPER_ADMIN', name: '超级管理员' },
  { code: 'TENANT_ADMIN', name: '租户管理员' },
  { code: 'DEPT_HEAD', name: '科室主任' },
  { code: 'DOCTOR', name: '主治医师' },
  { code: 'NURSE', name: '护士' },
  { code: 'AUDITOR', name: '审计员' },
]

interface AuthState {
  role: Role
  name: string
  setRole: (r: Role) => void
  login: (role: Role, name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('SUPER_ADMIN')
  const [name, setName] = useState('超级管理员')

  function login(r: Role, n: string) {
    setRole(r)
    setName(n)
    if (typeof document !== 'undefined') {
      document.cookie = `auth=1; path=/; max-age=86400`
      document.cookie = `role=${r}; path=/; max-age=86400`
    }
  }

  function logout() {
    setRole('SUPER_ADMIN')
    setName('')
    if (typeof document !== 'undefined') {
      document.cookie = 'auth=; path=/; max-age=0'
      document.cookie = 'role=; path=/; max-age=0'
    }
  }

  return (
    <AuthContext.Provider value={{ role, name, setRole: (r) => { setRole(r); document.cookie = `role=${r}; path=/; max-age=86400` }, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
