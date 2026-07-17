import Link from 'next/link'
import {
  Activity,
  ShieldCheck,
  Users,
  Building2,
  ScrollText,
  KeyRound,
  ArrowRight,
  HeartPulse,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

const features = [
  {
    icon: Activity,
    title: '实时监护大屏',
    desc: '设备状态、心率/呼吸/血氧/体温多参数实时曲线与报警联动。',
    href: '/dashboard',
    cta: '进入大屏',
    accent: 'text-chart-1',
  },
  {
    icon: ShieldCheck,
    title: '统一身份认证',
    desc: 'JWT 双令牌、多端会话、账号/验证码/OAuth2 与 2FA 多重登录。',
    href: '/login',
    cta: '前往登录',
    accent: 'text-primary',
  },
  {
    icon: KeyRound,
    title: 'RBAC + ABAC 权限',
    desc: '权限码、角色继承、数据范围、字段脱敏与动态职责分离。',
    href: '/admin/permissions',
    cta: '权限中心',
    accent: 'text-chart-5',
  },
  {
    icon: Building2,
    title: '多租户治理',
    desc: '字段级隔离、租户切换、版本白名单门控与一站式开通。',
    href: '/admin/tenants',
    cta: '租户管理',
    accent: 'text-chart-3',
  },
  {
    icon: Users,
    title: '组织与用户',
    desc: '用户、角色、部门、菜单一体化管理，闭包表层级继承。',
    href: '/admin/users',
    cta: '组织管理',
    accent: 'text-chart-4',
  },
  {
    icon: ScrollText,
    title: '审计与链路追踪',
    desc: '六类日志独立落库、自动脱敏，按 TraceId 还原完整请求轨迹。',
    href: '/admin/audit',
    cta: '审计日志',
    accent: 'text-chart-2',
  },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">智联医护</p>
              <p className="text-xs text-muted-foreground">IoT Monitoring Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              登录
            </Link>
            <Link href="/dashboard" className={buttonVariants({ size: 'sm' })}>
              监控大屏
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-chart-5" />
            医疗物联网 · 一体化监护与治理平台
          </span>
          <h1 className="mt-5 text-pretty text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            实时监护，安全可控的医护数字底座
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            从床旁设备实时监测，到身份认证、细粒度权限、多租户隔离与全链路审计，
            提供一套贯穿采集、治理与合规的完整解决方案。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className={buttonVariants({ size: 'lg' })}>
              查看监控大屏 <ArrowRight className="size-4" />
            </Link>
            <Link href="/admin/users" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              进入管理后台
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-secondary">
                <f.icon className={`size-5 ${f.accent}`} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {f.cta}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          智联医护 IoT Platform · 演示原型（模拟数据）· 数据仅用于界面演示
        </div>
      </footer>
    </main>
  )
}
