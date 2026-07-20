import { HeartPulse } from 'lucide-react'

// 内容区局部加载占位（不再全屏覆盖）—— 外壳已在 layout 挂载，loading 只在内容区显示
export default function Loading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
        <HeartPulse className="size-5 animate-pulse text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">加载中…</p>
    </div>
  )
}
