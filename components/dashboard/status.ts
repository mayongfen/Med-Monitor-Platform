import type { DeviceStatus } from '@/lib/monitor-types'

export const STATUS_META: Record<
  DeviceStatus,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  normal: {
    label: '正常',
    dot: 'bg-chart-5',
    text: 'text-chart-5',
    bg: 'bg-chart-5/10',
    border: 'border-chart-5/30',
  },
  warning: {
    label: '预警',
    dot: 'bg-chart-4',
    text: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
  },
  critical: {
    label: '危急',
    dot: 'bg-destructive',
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/40',
  },
  offline: {
    label: '离线',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  },
}
