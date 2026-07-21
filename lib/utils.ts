import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 去掉路径末尾的斜杠，用于路由比较。
 * trailingSlash:true 时 usePathname() 返回带尾斜杠的路径（如 /login/），
 * 直接和 '/login' 比较 has/includes 会失败；根路径 '/' 保留。
 */
export function normalizePathname(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}
