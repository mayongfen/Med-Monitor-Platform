import { HeartPulse } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
        <HeartPulse className="size-6 animate-pulse text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">加载中…</p>
    </div>
  )
}
