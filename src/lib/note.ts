export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** 从正文推断标题：优先第一个标题行，其次第一个非空行 */
export function deriveTitle(content: string): string {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const heading = line.match(/^#{1,6}\s+(.+)$/)
    if (heading) {
      return heading[1].replace(/[*_`]/g, '').trim().slice(0, 40) || '无标题笔记'
    }
  }

  const first = lines[0]?.replace(/^[>*\-\s]+/, '').replace(/[*_`]/g, '').trim()
  return (first || '无标题笔记').slice(0, 40)
}

/** 中文按字计数，西文按词计数 */
export function countWords(text: string): number {
  const cjk = text.match(/[\u4e00-\u9fa5]/g)?.length ?? 0
  const latin = text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0
  return cjk + latin
}

/** 列表页摘要：去掉 Markdown 语法，压成一行 */
export function toSnippet(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[[ xX]\]/g, ' ')
    .replace(/[*_`>~-]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatTime(ts: number): string {
  const date = new Date(ts)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  }
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}
