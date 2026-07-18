'use client'

import { useState, type ReactNode } from 'react'
import { Menu as MenuIcon } from 'lucide-react'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-svh bg-background">
      {/* 桌面侧栏 */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {(description || actions) && (
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 md:mb-6">
              <div>
                {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
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

// 兼容：给需要汉堡按钮的地方
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClick}>
      <MenuIcon className="size-5" />
    </Button>
  )
}
