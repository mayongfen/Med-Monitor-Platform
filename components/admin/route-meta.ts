// 控制台路由 → 顶栏标题映射
// 外壳上提到根 layout 后，顶栏标题由当前路由推导（不再由各 page 传入）
export const ROUTE_TITLES: Record<string, string> = {
  '/': '系统首页',
  '/monitor/water': '电子水牌',
  '/monitor/alarms': '告警管理',
  '/monitor/rules': '告警规则',
  '/monitor/tasks': '监护任务',
  '/ward': '病区管理',
  '/ward/beds': '床位管理',
  '/devices': '设备库存',
  '/devices/maintain': '维护保养',
  '/patients': '患者档案',
  '/patients/admission': '住院办理',
  '/patients/archive': '住院归档',
  '/admin/users': '用户管理',
  '/admin/roles': '角色管理',
  '/admin/depts': '部门管理',
  '/admin/positions': '岗位管理',
  '/admin/menus': '菜单管理',
  '/admin/permissions': '权限矩阵',
  '/admin/tenants': '租户管理',
  '/admin/approvals': '申请与委托',
  '/admin/audit': '审计日志',
  '/admin/trace': '链路追踪',
}

export function routeTitle(pathname: string): string {
  return ROUTE_TITLES[pathname] ?? '控制台'
}
