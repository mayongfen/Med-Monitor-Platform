import Link from 'next/link'
import { Activity, HeartPulse, Layers, ShieldCheck } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'JWT 双令牌', desc: 'Access + Refresh，多端登录与会话管理' },
  { icon: Layers, title: '多租户隔离', desc: '字段级隔离，邮箱全局唯一，登录后自动落点' },
  { icon: Activity, title: '全量审计', desc: '登录 / 操作 / 异常六类日志，链路可追溯' },
]

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col bg-background lg:flex-row">
      {/* 品牌侧 */}
      <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <HeartPulse className="size-5" />
          </div>
          <span className="text-lg font-semibold">某某医护平台</span>
        </Link>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight text-balance">
            医疗物联网统一身份与访问管理平台
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80 text-pretty">
            面向 ICU / CCU 场景的多床位实时监护，融合企业级 RBAC + ABAC 权限、多租户隔离与全链路审计，
            为医院信息系统提供安全合规的访问底座。
          </p>
          <div className="mt-8 flex flex-col gap-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <h.icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="text-xs text-primary-foreground/70">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60">© 2026 某某医护平台 · 仅供演示的前端原型</p>
      </section>

      {/* 表单侧 */}
      <section className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="size-6" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">某某医护平台</h1>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">欢迎回来</h2>
            <p className="mt-1 text-sm text-muted-foreground">请选择一种方式登录你的账户</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
