'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { normalizePathname } from '@/lib/utils'

// 无需登录即可访问的路由：登录页 + 实时监护大屏
// 与 conditional-shell 的 STANDALONE_ROUTES 保持一致
const PUBLIC_PATHS = ['/login', '/dashboard']

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const hit = document.cookie.split('; ').find((c) => c.startsWith(name + '='))
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null
}

/**
 * 客户端登录守卫。
 *
 * 适配 next.config 里的 output:'export' 静态导出 —— 没有服务端运行时，
 * 无法用 middleware 在请求时拦截，因此改为在浏览器端检查 cookie：
 *  - 受保护路由 + 无 auth cookie → 跳转 /login?redirect=当前路径
 *  - 公开路由（/login、/dashboard）一律放行
 *
 * 注意：这是体验级守卫，不是安全隔离。静态导出的页面 HTML 本身就是公开的，
 * 客户端跳转前可能闪现一帧内容。需要真·隔离请改用服务端部署 + middleware。
 *
 * redirect 使用 usePathname()（已剥离 basePath），登录后 router.push(redirect)
 * 会被 Next 自动补回 basePath，故无需在此手动拼接 basePath。
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // trailingSlash:true 时 pathname 带尾斜杠（/login/），归一化后判断公开路由，
    // 否则登录页会被守卫误拦、可能循环跳转
    if (PUBLIC_PATHS.includes(normalizePathname(pathname))) return
    if (!readCookie('auth')) {
      const search = typeof window !== 'undefined' ? window.location.search : ''
      // redirect 用原始 pathname（带尾斜杠，符合 trailingSlash 约定）
      router.replace(`/login?redirect=${encodeURIComponent(pathname + search)}`)
    }
  }, [pathname, router])

  return <>{children}</>
}
