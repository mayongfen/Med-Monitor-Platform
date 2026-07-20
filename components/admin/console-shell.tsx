'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { PageTransition } from './page-transition'
import { routeTitle } from './route-meta'
import { Sheet, SheetContent } from '@/components/ui/sheet'

/**
 * 控制台外壳：侧栏 + 顶栏 + 内容区。
 * 挂载在根 layout（经 ConditionalShell），跨路由只挂载一次 ——
 * 切换菜单时侧栏 / 顶栏不卸载，仅内容区（children）随路由切换并播放过渡动画。
 */
export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const title = routeTitle(pathname)

  // 路由切换后内容区滚动归零（外壳不重挂载，main 的 scrollTop 会残留）
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex h-svh bg-background">
      {/* 桌面侧栏 —— 仅挂载一次，跨路由不卸载 */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} onOpenMobile={() => setMobileOpen(true)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* 移动端抽屉 */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
