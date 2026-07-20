'use client'

import { useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function useConfirm() {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null)

  function confirm(opts: ConfirmOptions = {}): Promise<boolean> {
    return new Promise((resolve) => setState({ opts, resolve }))
  }

  const dialog = state && (
    <Dialog
      open
      // 确认弹窗同样禁用外部点击关闭，避免误触确认 destructive 操作；
      // 用户必须显式点「取消」或「确认」。
      disablePointerDismissal
      onOpenChange={(o) => { if (!o) { state.resolve(false); setState(null) } }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.opts.title || '确认操作'}</DialogTitle>
          {state.opts.description && <DialogDescription>{state.opts.description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => { state.resolve(false); setState(null) }}>
            {state.opts.cancelText || '取消'}
          </Button>
          <Button
            variant={state.opts.variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => { state.resolve(true); setState(null) }}
          >
            {state.opts.confirmText || '确认'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { confirm, dialog }
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  /**
   * 是否允许点击弹窗外部（遮罩）关闭。默认 `false`。
   *
   * 表单弹窗默认禁用外部点击关闭，避免用户误触遮罩导致已填内容被清空。
   * 仅在无表单状态、纯展示类弹窗需要「点外部关闭」时显式传 `dismissible`。
   */
  dismissible = false,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  dismissible?: boolean
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      disablePointerDismissal={!dismissible}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
