import {
  Activity,
  Building2,
  FolderTree,
  GitBranch,
  LayoutDashboard,
  Menu as MenuIcon,
  ScrollText,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavLink = { title: string; href: string; icon: LucideIcon }
export type NavGroup = { label: string; items: NavLink[] }

export const NAV_GROUPS: NavGroup[] = [
  {
    label: '监控',
    items: [{ title: '实时监护大屏', href: '/dashboard', icon: Activity }],
  },
  {
    label: '身份与认证',
    items: [
      { title: '用户管理', href: '/admin/users', icon: Users },
      { title: '角色管理', href: '/admin/roles', icon: UserCog },
      { title: '部门管理', href: '/admin/depts', icon: FolderTree },
      { title: '菜单管理', href: '/admin/menus', icon: MenuIcon },
    ],
  },
  {
    label: '权限',
    items: [
      { title: '权限矩阵', href: '/admin/permissions', icon: ShieldCheck },
      { title: '申请与委托', href: '/admin/approvals', icon: LayoutDashboard },
    ],
  },
  {
    label: '多租户',
    items: [{ title: '租户管理', href: '/admin/tenants', icon: Building2 }],
  },
  {
    label: '审计',
    items: [
      { title: '日志查询', href: '/admin/audit', icon: ScrollText },
      { title: '链路追踪', href: '/admin/trace', icon: GitBranch },
    ],
  },
]
