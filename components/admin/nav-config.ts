import {
  LayoutDashboard,
  Tv,
  BellRing,
  Building2,
  BedDouble,
  HardDrive,
  Wrench,
  User,
  LogIn,
  Archive,
  SlidersHorizontal,
  Users,
  UserCog,
  FolderTree,
  Briefcase,
  Menu as MenuIcon,
  ShieldCheck,
  ScrollText,
  GitBranch,
  type LucideIcon,
} from 'lucide-react'

export type NavLink = { title: string; href: string; icon: LucideIcon }
export type NavGroup = { label: string; items: NavLink[] }

export const NAV_GROUPS: NavGroup[] = [
  {
    label: '工作台',
    items: [{ title: '系统首页', href: '/', icon: LayoutDashboard }],
  },
  {
    label: '监护管理',
    items: [
      { title: '电子水牌', href: '/monitor/water', icon: Tv },
      { title: '告警管理', href: '/monitor/alarms', icon: BellRing },
      { title: '告警规则', href: '/monitor/rules', icon: SlidersHorizontal },
    ],
  },
  {
    label: '病区管理',
    items: [
      { title: '病区管理', href: '/ward', icon: Building2 },
      { title: '床位管理', href: '/ward/beds', icon: BedDouble },
    ],
  },
  {
    label: '设备管理',
    items: [
      { title: '设备库存', href: '/devices', icon: HardDrive },
      { title: '维护保养', href: '/devices/maintain', icon: Wrench },
    ],
  },
  {
    label: '住院管理',
    items: [
      { title: '住院档案', href: '/patients', icon: User },
      { title: '住院办理', href: '/patients/admission', icon: LogIn },
      { title: '住院归档', href: '/patients/archive', icon: Archive },
    ],
  },
  {
    label: '系统管理',
    items: [
      { title: '用户管理', href: '/admin/users', icon: Users },
      { title: '角色管理', href: '/admin/roles', icon: UserCog },
      { title: '部门管理', href: '/admin/depts', icon: FolderTree },
      { title: '岗位管理', href: '/admin/positions', icon: Briefcase },
      { title: '菜单管理', href: '/admin/menus', icon: MenuIcon },
      { title: '权限矩阵', href: '/admin/permissions', icon: ShieldCheck },
      { title: '租户管理', href: '/admin/tenants', icon: Building2 },
      { title: '审计日志', href: '/admin/audit', icon: ScrollText },
      { title: '链路追踪', href: '/admin/trace', icon: GitBranch },
    ],
  },
]
