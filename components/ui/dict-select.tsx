'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/**
 * 字典下拉选项。
 * value 与 label 强绑定：value 是存储/传输用键，label 是展示文本。
 */
export interface DictOption<V extends string> {
  value: V
  label: string
  disabled?: boolean
}

export interface DictSelectProps<V extends string> {
  value: V
  onValueChange: (v: V) => void
  options: ReadonlyArray<DictOption<V>>
  placeholder?: string
  className?: string
  disabled?: boolean
}

/**
 * 字典下拉组件。
 *
 * 为什么需要它：base-ui 的 `SelectValue` 默认依赖「已挂载的 SelectItem」反查 label，
 * 而 SelectItem 在 Popup Portal 内、首次打开前未挂载，导致初始渲染直接把 value（字典 key）
 * 当文本显示。本组件在内部用 `SelectValue` 的 render-fn children `(v) => labelOf(v)`
 * 显式映射 value→label，**不依赖 items 注册**，彻底避免「显示 key 而非值」的问题。
 *
 * 业务侧只声明 `options`（或用 `dictOptions(Record)` 生成）与泛型 V，无法写出 key/label 错配。
 */
export function DictSelect<V extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
}: DictSelectProps<V>) {
  const labelOf = (v: string | null) =>
    options.find((o) => o.value === v)?.label ?? placeholder ?? ''

  return (
    <Select
      value={value}
      // base-ui 的 onValueChange 签名是 (value: string | null, eventDetails) => void；
      // 在这里收窄 null 并断言为 V，业务侧的 onValueChange 只需 (v: V) => void，
      // 因此直接传 useState 的 setter 也不会产生 string|null 的类型冲突。
      onValueChange={(v) => {
        if (v != null) onValueChange(v as V)
      }}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {(v: string | null) => labelOf(v) || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * 从 `Record<V, string>` 字典生成 `DictOption<V>[]`。
 * 让「字典定义」与「下拉选项」始终同源，避免多处重复列举 key。
 */
export function dictOptions<V extends string>(dict: Record<V, string>): DictOption<V>[] {
  return (Object.keys(dict) as V[]).map((v) => ({ value: v, label: dict[v] }))
}
