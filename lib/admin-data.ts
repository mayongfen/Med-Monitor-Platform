// 后台管理系统的模拟数据（前端原型）

export type Tenant = {
  id: number
  name: string
  code: string
  edition: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended'
  userCount: number
  createdAt: string
}

export const TENANTS: Tenant[] = [
  { id: 0, name: '平台（全局）', code: 'PLATFORM', edition: 'enterprise', status: 'active', userCount: 6, createdAt: '2025-01-01' },
  { id: 101, name: '某某医院', code: 'HOSP01', edition: 'enterprise', status: 'active', userCount: 128, createdAt: '2025-03-12' },
  { id: 102, name: '某某门诊部', code: 'CLINIC01', edition: 'pro', status: 'active', userCount: 47, createdAt: '2025-06-08' },
  { id: 103, name: '社区康复中心', code: 'COMM', edition: 'free', status: 'suspended', userCount: 12, createdAt: '2025-09-21' },
]

export type Dept = {
  id: number
  name: string
  parentId: number | null
  leader: string
  scope: 'self' | 'dept' | 'tenant'
  order: number
}

export const DEPTS: Dept[] = [
  { id: 1, name: '某某医院', parentId: null, leader: '院长办公室', scope: 'tenant', order: 1 },
  { id: 2, name: '重症医学科 (ICU)', parentId: 1, leader: '张主任', scope: 'dept', order: 1 },
  { id: 3, name: '心血管内科 (CCU)', parentId: 1, leader: '李主任', scope: 'dept', order: 2 },
  { id: 4, name: 'ICU-A 病区', parentId: 2, leader: '王护士长', scope: 'dept', order: 1 },
  { id: 5, name: 'ICU-B 病区', parentId: 2, leader: '刘护士长', scope: 'dept', order: 2 },
  { id: 6, name: '信息科', parentId: 1, leader: '陈工', scope: 'dept', order: 3 },
]

export type Role = {
  id: number
  name: string
  code: string
  parentId: number | null
  dataScope: 'self' | 'dept' | 'dept_and_child' | 'tenant' | 'all'
  permissions: number
  members: number
  builtin: boolean
  desc: string
}

// 角色代码（字符串字面量），用于权限判断与告警分发，运行时即 ROLES[].code
export type RoleCode = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'DEPT_HEAD' | 'DOCTOR' | 'NURSE' | 'AUDITOR'

export const ROLE_CODE_LABEL: Record<RoleCode, string> = {
  SUPER_ADMIN: '超级管理员',
  TENANT_ADMIN: '租户管理员',
  DEPT_HEAD: '科室主任',
  DOCTOR: '主治医师',
  NURSE: '护士',
  AUDITOR: '审计员',
}

// 全局视角角色：不受病区范围与规则 notifyRoles 限制，可看到全部告警（运维 / 审计视角）
export const GLOBAL_ROLES: RoleCode[] = ['SUPER_ADMIN', 'TENANT_ADMIN', 'AUDITOR']
export function isGlobalRole(code: RoleCode): boolean {
  return GLOBAL_ROLES.includes(code)
}

export const ROLES: Role[] = [
  { id: 1, name: '超级管理员', code: 'SUPER_ADMIN', parentId: null, dataScope: 'all', permissions: 999, members: 2, builtin: true, desc: '平台态运维，通配 *:*:*' },
  { id: 2, name: '租户管理员', code: 'TENANT_ADMIN', parentId: 1, dataScope: 'tenant', permissions: 86, members: 4, builtin: true, desc: '租户内全部管理权限' },
  { id: 3, name: '科室主任', code: 'DEPT_HEAD', parentId: 2, dataScope: 'dept_and_child', permissions: 42, members: 8, builtin: false, desc: '本科室及子部门数据' },
  { id: 4, name: '主治医师', code: 'DOCTOR', parentId: 3, dataScope: 'dept', permissions: 28, members: 34, builtin: false, desc: '本病区监护与病历' },
  { id: 5, name: '护士', code: 'NURSE', parentId: 4, dataScope: 'dept', permissions: 16, members: 62, builtin: false, desc: '监护数据录入与查看' },
  { id: 6, name: '只读审计员', code: 'AUDITOR', parentId: null, dataScope: 'tenant', permissions: 9, members: 3, builtin: false, desc: '仅可查看审计日志' },
]

export type User = {
  id: number
  name: string
  username: string
  email: string
  phone: string
  deptId: number
  roles: string[]
  tenantId: number
  // 负责病区：非全局角色仅能看到这些病区的患者与告警；空数组表示全局视角
  wardIds: string[]
  status: 'active' | 'disabled' | 'locked'
  twoFA: boolean
  lastLogin: string
  sessions: number
}

export const USERS: User[] = [
  { id: 1, name: '超级管理员', username: 'admin', email: 'admin@platform.io', phone: '138****0001', deptId: 6, roles: ['SUPER_ADMIN'], tenantId: 0, wardIds: [], status: 'active', twoFA: true, lastLogin: '2026-07-16 15:42', sessions: 2 },
  { id: 2, name: '周建国', username: 'zhoujg', email: 'zhoujg@renji.com', phone: '139****2048', deptId: 1, roles: ['TENANT_ADMIN'], tenantId: 101, wardIds: [], status: 'active', twoFA: true, lastLogin: '2026-07-16 14:08', sessions: 1 },
  { id: 3, name: '张主任', username: 'zhangzr', email: 'zhang@renji.com', phone: '137****5521', deptId: 2, roles: ['DEPT_HEAD', 'DOCTOR'], tenantId: 101, wardIds: ['W01', 'W02'], status: 'active', twoFA: true, lastLogin: '2026-07-16 13:20', sessions: 3 },
  { id: 4, name: '李慧', username: 'lihui', email: 'lihui@renji.com', phone: '136****7789', deptId: 4, roles: ['DOCTOR'], tenantId: 101, wardIds: ['W01'], status: 'active', twoFA: false, lastLogin: '2026-07-16 09:55', sessions: 1 },
  { id: 5, name: '王芳', username: 'wangfang', email: 'wangf@renji.com', phone: '135****3312', deptId: 4, roles: ['NURSE'], tenantId: 101, wardIds: ['W01'], status: 'active', twoFA: false, lastLogin: '2026-07-15 22:10', sessions: 1 },
  { id: 6, name: '陈杰', username: 'chenjie', email: 'chenjie@xiehe.com', phone: '134****8890', deptId: 3, roles: ['DOCTOR'], tenantId: 102, wardIds: ['W03'], status: 'locked', twoFA: true, lastLogin: '2026-07-10 08:00', sessions: 0 },
  { id: 7, name: '审计小组', username: 'auditor', email: 'audit@renji.com', phone: '133****0100', deptId: 6, roles: ['AUDITOR'], tenantId: 101, wardIds: [], status: 'active', twoFA: true, lastLogin: '2026-07-16 11:30', sessions: 1 },
  { id: 8, name: '孙浩', username: 'sunhao', email: 'sunhao@xiehe.com', phone: '132****4567', deptId: 3, roles: ['NURSE'], tenantId: 102, wardIds: ['W03'], status: 'disabled', twoFA: false, lastLogin: '2026-06-28 16:45', sessions: 0 },
]

export type MenuItem = {
  id: number
  name: string
  type: 'catalog' | 'menu' | 'button'
  path?: string
  icon?: string
  perm?: string
  parentId: number | null
  order: number
  visible: boolean
}

export const MENUS: MenuItem[] = [
  { id: 1, name: '监控中心', type: 'catalog', icon: 'Activity', parentId: null, order: 1, visible: true },
  { id: 2, name: '实时监护大屏', type: 'menu', path: '/dashboard', perm: 'monitor:view:dept', parentId: 1, order: 1, visible: true },
  { id: 10, name: '系统管理', type: 'catalog', icon: 'Settings', parentId: null, order: 2, visible: true },
  { id: 11, name: '用户管理', type: 'menu', path: '/admin/users', perm: 'user:list:tenant', parentId: 10, order: 1, visible: true },
  { id: 12, name: '新增用户', type: 'button', perm: 'user:create:tenant', parentId: 11, order: 1, visible: true },
  { id: 13, name: '角色管理', type: 'menu', path: '/admin/roles', perm: 'role:list:tenant', parentId: 10, order: 2, visible: true },
  { id: 14, name: '部门管理', type: 'menu', path: '/admin/depts', perm: 'dept:list:tenant', parentId: 10, order: 3, visible: true },
  { id: 15, name: '菜单管理', type: 'menu', path: '/admin/menus', perm: 'menu:list:all', parentId: 10, order: 4, visible: true },
  { id: 20, name: '权限中心', type: 'catalog', icon: 'ShieldCheck', parentId: null, order: 3, visible: true },
  { id: 21, name: '权限矩阵', type: 'menu', path: '/admin/permissions', perm: 'perm:list:tenant', parentId: 20, order: 1, visible: true },
  { id: 22, name: '申请与审批', type: 'menu', path: '/admin/approvals', perm: 'perm:approve:tenant', parentId: 20, order: 2, visible: true },
  { id: 30, name: '租户管理', type: 'catalog', icon: 'Building2', parentId: null, order: 4, visible: true },
  { id: 31, name: '租户列表', type: 'menu', path: '/admin/tenants', perm: 'tenant:list:all', parentId: 30, order: 1, visible: true },
  { id: 40, name: '审计日志', type: 'catalog', icon: 'ScrollText', parentId: null, order: 5, visible: true },
  { id: 41, name: '日志查询', type: 'menu', path: '/admin/audit', perm: 'audit:list:tenant', parentId: 40, order: 1, visible: true },
  { id: 42, name: '链路追踪', type: 'menu', path: '/admin/trace', perm: 'audit:trace:tenant', parentId: 40, order: 2, visible: true },
]

export const EDITION_LABEL: Record<Tenant['edition'], string> = {
  free: '免费版',
  pro: '专业版',
  enterprise: '旗舰版',
}

export const DATA_SCOPE_LABEL: Record<Role['dataScope'], string> = {
  self: '仅本人',
  dept: '本部门',
  dept_and_child: '本部门及子级',
  tenant: '本租户',
  all: '全部数据',
}

export function deptName(id: number) {
  return DEPTS.find((d) => d.id === id)?.name ?? '-'
}

export function tenantName(id: number) {
  return TENANTS.find((t) => t.id === id)?.name ?? '-'
}

export function findUser(id: number): User | undefined {
  return USERS.find((u) => u.id === id)
}

export function findUserByUsername(username: string): User | undefined {
  return USERS.find((u) => u.username === username)
}

// ── 权限矩阵（RBAC + ABAC）─────────────────────────────
export type Permission = {
  id: number
  code: string // resource:action:scope
  name: string
  group: string
  risk: 'low' | 'medium' | 'high'
  // 各内置角色是否具备该权限
  roles: Record<string, boolean>
}

export const PERMISSION_ROLE_CODES = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPT_HEAD', 'DOCTOR', 'NURSE', 'AUDITOR'] as const

export const PERMISSIONS: Permission[] = [
  { id: 1, code: 'monitor:view:dept', name: '查看监护大屏', group: '监控', risk: 'low', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: true, DOCTOR: true, NURSE: true, AUDITOR: false } },
  { id: 2, code: 'monitor:alarm:ack', name: '报警确认与处置', group: '监控', risk: 'medium', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: true, DOCTOR: true, NURSE: true, AUDITOR: false } },
  { id: 3, code: 'user:list:tenant', name: '查看用户列表', group: '身份', risk: 'low', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: true, DOCTOR: false, NURSE: false, AUDITOR: true } },
  { id: 4, code: 'user:create:tenant', name: '新增用户', group: '身份', risk: 'medium', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: false, DOCTOR: false, NURSE: false, AUDITOR: false } },
  { id: 5, code: 'user:reset:tenant', name: '重置密码 / 解锁', group: '身份', risk: 'high', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: false, DOCTOR: false, NURSE: false, AUDITOR: false } },
  { id: 6, code: 'role:assign:tenant', name: '分配角色', group: '权限', risk: 'high', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: false, DOCTOR: false, NURSE: false, AUDITOR: false } },
  { id: 7, code: 'perm:approve:tenant', name: '审批权限申请', group: '权限', risk: 'high', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: true, DOCTOR: false, NURSE: false, AUDITOR: false } },
  { id: 8, code: 'tenant:list:all', name: '查看租户列表', group: '多租户', risk: 'medium', roles: { SUPER_ADMIN: true, TENANT_ADMIN: false, DEPT_HEAD: false, DOCTOR: false, NURSE: false, AUDITOR: false } },
  { id: 9, code: 'tenant:manage:all', name: '开通 / 停用租户', group: '多租户', risk: 'high', roles: { SUPER_ADMIN: true, TENANT_ADMIN: false, DEPT_HEAD: false, DOCTOR: false, NURSE: false, AUDITOR: false } },
  { id: 10, code: 'audit:list:tenant', name: '查询审计日志', group: '审计', risk: 'low', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: false, DOCTOR: false, NURSE: false, AUDITOR: true } },
  { id: 11, code: 'audit:trace:tenant', name: '链路追踪还原', group: '审计', risk: 'medium', roles: { SUPER_ADMIN: true, TENANT_ADMIN: true, DEPT_HEAD: false, DOCTOR: false, NURSE: false, AUDITOR: true } },
  { id: 12, code: 'audit:export:tenant', name: '导出审计报表', group: '审计', risk: 'high', roles: { SUPER_ADMIN: true, TENANT_ADMIN: false, DEPT_HEAD: false, DOCTOR: false, NURSE: false, AUDITOR: false } },
]

export const RISK_LABEL: Record<Permission['risk'], string> = {
  low: '低',
  medium: '中',
  high: '高',
}

// ── 权限申请与委托 ────────────────────────────────────
export type ApprovalRequest = {
  id: string
  type: 'grant' | 'delegate'
  applicant: string
  target: string // 申请的权限 / 角色 或委托对象
  reason: string
  scope: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approver: string
  expireAt?: string // 委托到期时间
}

export const APPROVALS: ApprovalRequest[] = [
  { id: 'REQ-20260716-01', type: 'grant', applicant: '李慧（主治医师）', target: 'user:reset:tenant', reason: '夜班需为新入职护士重置初始密码', scope: 'ICU-A 病区', status: 'pending', createdAt: '2026-07-16 20:14', approver: '张主任' },
  { id: 'REQ-20260716-02', type: 'delegate', applicant: '张主任（科室主任）', target: '王芳（护士）', reason: '外出学术会议 3 天，临时委托病区管理', scope: '重症医学科', status: 'pending', createdAt: '2026-07-16 18:02', approver: '周建国', expireAt: '2026-07-20 09:00' },
  { id: 'REQ-20260715-08', type: 'grant', applicant: '孙浩（护士）', target: 'audit:list:tenant', reason: '协助质控科整理月度监护记录', scope: '某某门诊部', status: 'approved', createdAt: '2026-07-15 10:30', approver: '周建国' },
  { id: 'REQ-20260714-03', type: 'grant', applicant: '陈杰（主治医师）', target: 'audit:export:tenant', reason: '导出季度审计报表用于外部审计', scope: '某某门诊部', status: 'rejected', createdAt: '2026-07-14 15:48', approver: '超级管理员' },
  { id: 'REQ-20260713-05', type: 'delegate', applicant: '周建国（租户管理员）', target: '审计小组', reason: '年假期间委托日常用户审批', scope: '某某医院', status: 'approved', createdAt: '2026-07-13 09:12', approver: '超级管理员', expireAt: '2026-07-27 09:00' },
]

export const APPROVAL_STATUS_LABEL: Record<ApprovalRequest['status'], string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
}

// ── 审计日志（六类独立落库）──────────────────────────
export type AuditLog = {
  id: number
  traceId: string
  time: string
  category: 'login' | 'operation' | 'data' | 'permission' | 'security' | 'system'
  actor: string
  action: string
  target: string
  ip: string
  result: 'success' | 'fail'
}

export const AUDIT_CATEGORY_LABEL: Record<AuditLog['category'], string> = {
  login: '登录日志',
  operation: '操作日志',
  data: '数据变更',
  permission: '权限变更',
  security: '安全事件',
  system: '系统日志',
}

export const AUDIT_LOGS: AuditLog[] = [
  { id: 1, traceId: 'tr-8f3a1c92', time: '2026-07-16 15:42:11', category: 'login', actor: 'admin', action: '账号密码 + 2FA 登录', target: 'platform', ip: '10.12.3.8', result: 'success' },
  { id: 2, traceId: 'tr-8f3a1c92', time: '2026-07-16 15:42:13', category: 'operation', actor: 'admin', action: '查询用户列表', target: '/admin/users', ip: '10.12.3.8', result: 'success' },
  { id: 3, traceId: 'tr-7b21e0aa', time: '2026-07-16 14:08:55', category: 'permission', actor: 'zhoujg', action: '为 lihui 分配角色 DOCTOR', target: 'user#4', ip: '10.20.5.31', result: 'success' },
  { id: 4, traceId: 'tr-55c9d1fe', time: '2026-07-16 13:20:02', category: 'data', actor: 'zhangzr', action: '修改病区阈值配置', target: 'ward#ICU-A', ip: '10.20.5.44', result: 'success' },
  { id: 5, traceId: 'tr-91aa77b3', time: '2026-07-16 11:31:40', category: 'security', actor: 'chenjie', action: '连续 5 次密码错误触发账号锁定', target: 'user#6', ip: '10.31.8.19', result: 'fail' },
  { id: 6, traceId: 'tr-6de40c17', time: '2026-07-16 09:55:23', category: 'login', actor: 'lihui', action: '账号密码登录', target: 'renji', ip: '10.20.5.44', result: 'success' },
  { id: 7, traceId: 'tr-6de40c17', time: '2026-07-16 09:55:41', category: 'operation', actor: 'lihui', action: '确认心率高限报警', target: 'device#BED-A03', ip: '10.20.5.44', result: 'success' },
  { id: 8, traceId: 'tr-22f1b8d0', time: '2026-07-15 22:11:08', category: 'system', actor: 'system', action: '每日审计日志归档任务', target: 'audit-archive', ip: '127.0.0.1', result: 'success' },
]

// ── 链路追踪（TraceId 还原请求轨迹）─────────────────────
export type TraceSpan = {
  id: string
  service: string
  operation: string
  startOffsetMs: number
  durationMs: number
  status: 'ok' | 'error'
  depth: number
}

export type Trace = {
  traceId: string
  entry: string
  actor: string
  time: string
  totalMs: number
  status: 'ok' | 'error'
  spans: TraceSpan[]
}

export const TRACES: Trace[] = [
  {
    traceId: 'tr-6de40c17',
    entry: 'POST /api/alarm/ack',
    actor: 'lihui',
    time: '2026-07-16 09:55:41',
    totalMs: 186,
    status: 'ok',
    spans: [
      { id: 's1', service: 'api-gateway', operation: '路由鉴权 + JWT 校验', startOffsetMs: 0, durationMs: 18, status: 'ok', depth: 0 },
      { id: 's2', service: 'auth-service', operation: '权限码校验 monitor:alarm:ack', startOffsetMs: 18, durationMs: 22, status: 'ok', depth: 1 },
      { id: 's3', service: 'monitor-service', operation: '写入报警确认记录', startOffsetMs: 40, durationMs: 96, status: 'ok', depth: 1 },
      { id: 's4', service: 'monitor-service → db', operation: 'UPDATE alarm SET acked', startOffsetMs: 60, durationMs: 54, status: 'ok', depth: 2 },
      { id: 's5', service: 'audit-service', operation: '异步落库操作日志', startOffsetMs: 140, durationMs: 40, status: 'ok', depth: 1 },
    ],
  },
  {
    traceId: 'tr-91aa77b3',
    entry: 'POST /api/auth/login',
    actor: 'chenjie',
    time: '2026-07-16 11:31:40',
    totalMs: 240,
    status: 'error',
    spans: [
      { id: 's1', service: 'api-gateway', operation: '路由转发', startOffsetMs: 0, durationMs: 12, status: 'ok', depth: 0 },
      { id: 's2', service: 'auth-service', operation: '校验密码', startOffsetMs: 12, durationMs: 88, status: 'error', depth: 1 },
      { id: 's3', service: 'auth-service', operation: '累计失败次数 = 5，锁定账号', startOffsetMs: 100, durationMs: 60, status: 'error', depth: 1 },
      { id: 's4', service: 'audit-service', operation: '写入安全事件日志', startOffsetMs: 160, durationMs: 68, status: 'ok', depth: 1 },
    ],
  },
]

// ── 岗位管理 ──────────────────────────────────────────
export type PositionStatus = 'open' | 'closed'

export interface Position {
  id: number
  name: string
  code: string
  order: number
  status: PositionStatus
  remark: string
  createdAt: string
}

export const POSITIONS: Position[] = [
  { id: 1, name: '科主任', code: 'DEPT_DIR', order: 1, status: 'open', remark: '科室负责人', createdAt: '2025-01-01' },
  { id: 2, name: '护士长', code: 'HEAD_NURSE', order: 2, status: 'open', remark: '病区护理管理', createdAt: '2025-01-01' },
  { id: 3, name: '主治医师', code: 'ATTENDING', order: 3, status: 'open', remark: '临床诊疗', createdAt: '2025-01-01' },
  { id: 4, name: '住院医师', code: 'RESIDENT', order: 4, status: 'open', remark: '病区值班', createdAt: '2025-01-01' },
  { id: 5, name: '责任护士', code: 'RN', order: 5, status: 'open', remark: '床位护理', createdAt: '2025-01-01' },
  { id: 6, name: '设备工程师', code: 'ENG', order: 6, status: 'open', remark: '监护设备维护', createdAt: '2025-01-01' },
  { id: 7, name: '质控专员', code: 'QC', order: 7, status: 'closed', remark: '质量与合规', createdAt: '2025-03-01' },
]

export const POSITION_STATUS_LABEL: Record<PositionStatus, string> = {
  open: '开启',
  closed: '关闭',
}
