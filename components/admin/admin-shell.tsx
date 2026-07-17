import type { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'

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
  return (
    <div className="flex h-svh bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {(description || actions) && (
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
