'use client'

import { useState, type ReactNode } from 'react'
import { Upload, FileText, CheckCircle2 } from 'lucide-react'
import { readFileAsText, parseCSV } from '@/lib/import'
import { FormDialog } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ImportDialog({
  open,
  onOpenChange,
  title,
  onImport,
  template,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  onImport: (rows: string[][]) => number
  template: string[]
}) {
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [imported, setImported] = useState<number | null>(null)

  async function handleFile(file: File) {
    const text = await readFileAsText(file)
    const result = parseCSV(text)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setPreview({ headers: result.headers, rows: result.rows.slice(0, 5) })
    const count = onImport(result.rows)
    setImported(count)
    toast.success(`成功导入 ${count} 条记录`)
  }

  function downloadTemplate() {
    const csv = [template.join(','), template.map(() => '示例').join(',')].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}-模板.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function close() {
    onOpenChange(false)
    setPreview(null)
    setImported(null)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => { if (!o) close(); onOpenChange(o) }}
      title={`导入${title}`}
      description="支持 CSV 格式，可先下载模板。"
      footer={
        <>
          <Button variant="outline" onClick={downloadTemplate}><FileText className="size-4" /> 下载模板</Button>
          <Button variant="outline" onClick={close}>关闭</Button>
        </>
      }
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 hover:border-primary/50">
        <Upload className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">点击或拖拽 CSV 文件到此处</span>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
      </label>

      {preview && (
        <div>
          <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3 text-chart-5" /> 预览（前 5 行）· 共导入 {imported} 条
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {preview.headers.map((h, i) => <th key={i} className="px-2 py-1 text-left font-medium text-muted-foreground">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {row.map((c, j) => <td key={j} className="px-2 py-1 text-foreground">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </FormDialog>
  )
}
