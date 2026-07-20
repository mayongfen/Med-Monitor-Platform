import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'

function renderSampleForm(opts: { onOpenChange?: (o: boolean) => void } = {}) {
  const onOpenChange = opts.onOpenChange ?? vi.fn()
  render(
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title="示例表单"
      description="测试"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={() => onOpenChange(false)}>保存</Button>
        </>
      }
    >
      <input aria-label="姓名" defaultValue="张三" />
    </FormDialog>,
  )
  return { onOpenChange }
}

describe('FormDialog 防误关', () => {
  it('点击弹窗外部（遮罩）不会关闭弹窗，保护已填内容', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderSampleForm()

    // 弹窗内容可见，证明已打开
    expect(screen.getByText('示例表单')).toBeInTheDocument()
    // 已填内容存在
    expect(screen.getByLabelText('姓名')).toHaveValue('张三')

    // 点击遮罩（dialog overlay）。遮罩是 fixed inset-0 的全屏层，
    // 用 pointer-events 模拟点击弹窗内容之外的区域。
    // base-ui 的 Backdrop 元素就是 overlay，点击它通常触发 outsidePress。
    const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement
    expect(overlay).toBeTruthy()
    await user.click(overlay)

    // 关键断言：onOpenChange 不应被调用（弹窗保持打开）
    expect(onOpenChange).not.toHaveBeenCalled()
    // 内容仍在
    expect(screen.getByText('示例表单')).toBeInTheDocument()
    expect(screen.getByLabelText('姓名')).toHaveValue('张三')
  })

  it('点击「取消」按钮仍可正常关闭弹窗', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderSampleForm()

    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  it('点击右上角关闭按钮（×）仍可关闭弹窗', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderSampleForm()

    // FormDialog 的 DialogContent 默认渲染右上角 Close 按钮（sr-only 文本 "Close"）
    const closeBtn = screen.getByRole('button', { name: /close/i })
    await user.click(closeBtn)

    expect(onOpenChange).toHaveBeenCalled()
  })

  it('dismissible 模式下允许点击外部关闭（保留能力）', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <FormDialog
        open
        onOpenChange={onOpenChange}
        title="可关闭弹窗"
        dismissible
        footer={<Button onClick={() => onOpenChange(false)}>取消</Button>}
      >
        <p>内容</p>
      </FormDialog>,
    )

    const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement
    await user.click(overlay)

    // dismissible 模式恢复外部点击关闭
    expect(onOpenChange).toHaveBeenCalled()
  })
})
