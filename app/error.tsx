'use client'

import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('页面错误：', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-7 text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">页面出错了</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {this.state.error?.message || '发生未知错误'}
            </p>
          </div>
          <Button onClick={() => this.setState({ hasError: false, error: undefined })}>
            <RefreshCw className="size-4" /> 重试
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
