// 前端 CSV 解析（不依赖后端）

export interface ParseResult {
  headers: string[]
  rows: string[][]
  error?: string
}

export function parseCSV(text: string): ParseResult {
  try {
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    if (lines.length < 2) return { headers: [], rows: [], error: 'CSV 至少需要表头 + 1 行数据' }

    const parseLine = (line: string): string[] => {
      const result: string[] = []
      let cur = ''
      let inQuote = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (inQuote) {
          if (ch === '"') {
            if (line[i + 1] === '"') { cur += '"'; i++ }
            else inQuote = false
          } else cur += ch
        } else {
          if (ch === ',') { result.push(cur); cur = '' }
          else if (ch === '"') inQuote = true
          else cur += ch
        }
      }
      result.push(cur)
      return result.map((s) => s.trim())
    }

    const headers = parseLine(lines[0])
    const rows = lines.slice(1).map(parseLine)
    return { headers, rows }
  } catch (e) {
    return { headers: [], rows: [], error: String(e) }
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsText(file)
  })
}
