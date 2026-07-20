import { type ReactNode } from 'react'

/**
 * 内容区页头 —— 外壳（侧栏 / 顶栏 / 移动端抽屉）已上提到 ConsoleShell（根 layout），
 * 此组件仅渲染内容区顶部的描述 / 操作行，由各 page 继续调用（签名保持兼容）。
 *
 * 注意：title 不再由此处使用，顶栏标题由 route-meta 按当前路由推导。
 */
export function AdminShell({
  description,
  actions,
  children,
}: {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      {(description || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 md:mb-6">
          <div>
            {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </>
  )
}
