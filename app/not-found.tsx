import Link from 'next/link'
import { Compass } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Compass className="size-7 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-foreground">页面不存在</h1>
        <p className="mt-1 text-sm text-muted-foreground">你访问的地址可能已被移除或从未存在。</p>
      </div>
      <Link href="/" className={buttonVariants()}>返回首页</Link>
    </div>
  )
}
