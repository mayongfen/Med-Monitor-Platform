'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { GitHubIcon, GoogleIcon, QQIcon } from './oauth-icons'
import { useAuth, toAuthUserByUsername } from '@/lib/auth'
import { cn } from '@/lib/utils'

type TwoFAMethod = 'totp' | 'email' | 'sms'

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [tab, setTab] = useState<'password' | 'code'>('password')
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<'login' | '2fa'>('login')
  const [error, setError] = useState<string | null>(null)

  // 账号密码
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')

  // 验证码登录
  const [target, setTarget] = useState('')
  const [channel, setChannel] = useState<'email' | 'sms'>('email')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  // 2FA
  const [twoFA, setTwoFA] = useState<TwoFAMethod>('totp')
  const [otp, setOtp] = useState('')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function startCountdown() {
    setCountdown(60)
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1 && timerRef.current) {
          clearInterval(timerRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  function sendCode() {
    if (!target) {
      setError(channel === 'email' ? '请输入邮箱地址' : '请输入手机号')
      return
    }
    setError(null)
    startCountdown()
  }

  function submitLogin(e: React.FormEvent) {
    e.preventDefault()
    if (tab === 'password' && !password) {
      setError('请输入密码')
      return
    }
    if (tab === 'code' && code.length < 4) {
      setError('请输入收到的验证码')
      return
    }
    setError(null)
    setLoading(true)
    // 模拟服务端校验 + 触发 2FA
    setTimeout(() => {
      setLoading(false)
      setStage('2fa')
    }, 900)
  }

  function verify2FA(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length < 6) {
      setError('请输入 6 位动态验证码')
      return
    }
    setError(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      login(toAuthUserByUsername(username))
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/'
      router.push(redirect)
    }, 900)
  }

  function oauth(provider: string) {
    setError(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStage('2fa')
    }, 700)
  }

  if (stage === '2fa') {
    const methods: { key: TwoFAMethod; label: string; icon: typeof ShieldCheck; hint: string }[] = [
      { key: 'totp', label: '认证器', icon: ShieldCheck, hint: '请输入 Authenticator / TOTP 应用中的 6 位动态码' },
      { key: 'email', label: '邮箱', icon: Mail, hint: '验证码已发送至你的邮箱，10 分钟内有效' },
      { key: 'sms', label: '短信', icon: Smartphone, hint: '验证码已发送至你的手机，5 分钟内有效' },
    ]
    const active = methods.find((m) => m.key === twoFA)!
    return (
      <form onSubmit={verify2FA} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">两步验证</h2>
          <p className="text-sm text-muted-foreground text-pretty">{active.hint}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {methods.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setTwoFA(m.key)
                setOtp('')
                setError(null)
              }}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-medium transition-colors',
                twoFA === m.key
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              <m.icon className="size-4" />
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="otp">动态验证码</Label>
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            placeholder="6 位验证码"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="text-center text-lg tracking-[0.4em]"
            autoFocus
          />
          {twoFA !== 'totp' && (
            <button type="button" className="self-end text-xs text-primary hover:underline">
              重新发送验证码
            </button>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="size-4 animate-spin" />}
          验证并登录
        </Button>
        <button
          type="button"
          onClick={() => {
            setStage('login')
            setOtp('')
            setError(null)
          }}
          className="text-center text-xs text-muted-foreground hover:text-foreground"
        >
          返回重新登录
        </button>
      </form>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password">
            <Lock className="size-4" /> 账号密码
          </TabsTrigger>
          <TabsTrigger value="code">
            <KeyRound className="size-4" /> 验证码
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <form onSubmit={submitLogin} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">账号 / 邮箱</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="用户名或邮箱"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">密码使用 PBKDF2 哈希存储，恒定时间比较校验。</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="size-4 animate-spin" />}
              登录
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="code">
          <form onSubmit={submitLogin} className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors',
                  channel === 'email'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                <Mail className="size-4" /> 邮箱
              </button>
              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors',
                  channel === 'sms'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                <MessageSquare className="size-4" /> 短信
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="target">{channel === 'email' ? '邮箱地址' : '手机号'}</Label>
              <Input
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={channel === 'email' ? 'name@example.com' : '11 位手机号'}
                inputMode={channel === 'email' ? 'email' : 'tel'}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">验证码</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 位验证码"
                  inputMode="numeric"
                  maxLength={6}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendCode}
                  disabled={countdown > 0}
                  className="shrink-0"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">一次性验证码消费即销毁，服务端恒定时间比较。</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="size-4 animate-spin" />}
              登录 / 注册
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">第三方登录</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => oauth('github')} disabled={loading} className="w-full">
          <GitHubIcon className="size-4" /> GitHub
        </Button>
        <Button variant="outline" onClick={() => oauth('google')} disabled={loading} className="w-full">
          <GoogleIcon className="size-4" /> Google
        </Button>
        <Button variant="outline" onClick={() => oauth('qq')} disabled={loading} className="w-full">
          <QQIcon className="size-4 text-[#12B7F5]" /> QQ
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground text-pretty">
        登录即表示同意《服务条款》与《隐私政策》。所有登录行为将写入审计日志。
      </p>
    </div>
  )
}
