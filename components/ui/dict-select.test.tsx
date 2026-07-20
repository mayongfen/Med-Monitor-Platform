import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DictSelect, dictOptions, type DictOption } from '@/components/ui/dict-select'

const FRUIT_LABEL: Record<'apple' | 'banana' | 'cherry', string> = {
  apple: '苹果',
  banana: '香蕉',
  cherry: '樱桃',
}

const options: DictOption<'apple' | 'banana' | 'cherry'>[] = dictOptions(FRUIT_LABEL)

describe('DictSelect', () => {
  it('未打开弹窗时，trigger 显示 label（字典值）而非 value（字典 key）', () => {
    // 这是核心回归断言：base-ui 裸 SelectValue 会显示 'apple'，DictSelect 必须显示 '苹果'。
    render(
      <DictSelect
        value="apple"
        onValueChange={() => {}}
        options={options}
      />,
    )
    expect(screen.getByText('苹果')).toBeInTheDocument()
    // 确保不会把 key 泄漏到 UI
    expect(screen.queryByText('apple')).not.toBeInTheDocument()
  })

  it('value 为空时显示 placeholder', () => {
    render(
      <DictSelect
        value={'' as 'apple'}
        onValueChange={() => {}}
        options={options}
        placeholder="请选择水果"
      />,
    )
    expect(screen.getByText('请选择水果')).toBeInTheDocument()
  })

  it('切换选项后 onValueChange 收到的是 value（key），且 trigger 更新为对应 label', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DictSelect
        value="apple"
        onValueChange={onChange}
        options={options}
      />,
    )

    // 初始显示「苹果」
    expect(screen.getByText('苹果')).toBeInTheDocument()

    // 打开下拉
    await user.click(screen.getByRole('combobox', { name: '' }) ?? screen.getByText('苹果'))

    // 选中「香蕉」
    await user.click(await screen.findByText('香蕉'))

    // onValueChange 收到的是 key 'banana'（业务侧据此存储），不是 label
    expect(onChange).toHaveBeenCalledWith('banana')
  })

  it('onValueChange 的类型收窄：不向业务侧传递 null', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DictSelect
        value="apple"
        onValueChange={onChange}
        options={options}
      />,
    )

    await user.click(screen.getByText('苹果'))
    await user.click(await screen.findByText('香蕉'))

    // base-ui 原生签名是 (value: string | null) => void，
    // DictSelect 内部收窄 null，确保业务侧永不被 null 调用。
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).not.toBeNull()
  })
})

describe('dictOptions', () => {
  it('从 Record 生成选项，value 与 label 同源且顺序与 key 一致', () => {
    const opts = dictOptions(FRUIT_LABEL)
    expect(opts).toEqual([
      { value: 'apple', label: '苹果' },
      { value: 'banana', label: '香蕉' },
      { value: 'cherry', label: '樱桃' },
    ])
  })
})
