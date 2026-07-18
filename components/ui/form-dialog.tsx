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
    <Dialog open onOpenChange={(o) => { if (!o) { state.resolve(false); setState(null) } }}>
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
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
