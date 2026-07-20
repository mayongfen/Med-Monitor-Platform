import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth'
import { StoreProvider } from '@/lib/store'
import { GlobalSearch } from '@/components/admin/global-search'
import { ConditionalShell } from '@/components/admin/conditional-shell'
import './globals.css'

export const metadata: Metadata = {
  title: '智联医护 · 非接触式智能监护系统',
  description: '机构版非接触式智能监护系统：实时监护、告警管理、住院全流程、设备与权限治理',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#1f6feb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="bg-background" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider><StoreProvider><GlobalSearch /><ConditionalShell>{children}</ConditionalShell></StoreProvider></AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
