import type { RoleCode } from '@/lib/admin-data'

// 各菜单所需的最小角色（越往下权限越低）。未列出的视为所有角色可见。
// 角色层级：SUPER_ADMIN > TENANT_ADMIN > DEPT_HEAD > DOCTOR > NURSE > AUDITOR
const ROLE_LEVEL: Record<RoleCode, number> = {
  SUPER_ADMIN: 100,
  TENANT_ADMIN: 80,
  DEPT_HEAD: 60,
  DOCTOR: 40,
  NURSE: 20,
  AUDITOR: 10,
}

// 菜单 href → 所需最小角色等级（不在此表的表示所有角色可见）
const PERMISSIONS: Record<string, number> = {
  '/admin/users': ROLE_LEVEL.TENANT_ADMIN,
  '/admin/roles': ROLE_LEVEL.TENANT_ADMIN,
  '/admin/menus': ROLE_LEVEL.TENANT_ADMIN,
  '/admin/permissions': ROLE_LEVEL.TENANT_ADMIN,
  '/admin/positions': ROLE_LEVEL.TENANT_ADMIN,
  '/admin/tenants': ROLE_LEVEL.SUPER_ADMIN,
  '/admin/audit': ROLE_LEVEL.TENANT_ADMIN,
  '/admin/trace': ROLE_LEVEL.TENANT_ADMIN,
  '/devices': ROLE_LEVEL.DEPT_HEAD,
  '/devices/maintain': ROLE_LEVEL.DEPT_HEAD,
  '/ward': ROLE_LEVEL.DEPT_HEAD,
  '/ward/beds': ROLE_LEVEL.NURSE,
  '/monitor/rules': ROLE_LEVEL.TENANT_ADMIN,
}

export function canAccess(href: string, role: RoleCode): boolean {
  const required = PERMISSIONS[href]
  if (required == null) return true
  return ROLE_LEVEL[role] >= required
}

export function roleLevel(role: RoleCode): number {
  return ROLE_LEVEL[role]
}
