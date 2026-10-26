import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  gfm: true,
  breaks: true,
})

/**
 * Markdown -> 安全的 HTML
 * - DOMPurify 过滤掉危险标签/属性
 * - 预览里的复选框可点击（去掉 disabled，并补上 task-list-item 类）
 * - 外链统一新窗口打开
 */
export function renderMarkdown(source: string): string {
  const raw = marked.parse(source, { async: false }) as string
  const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] })
  const doc = new DOMParser().parseFromString(clean, 'text/html')

  doc.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    box.removeAttribute('disabled')
    const item = box.closest('li')
    if (item) item.classList.add('task-list-item')
  })

  doc.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') ?? ''
    if (/^https?:/i.test(href)) {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noreferrer noopener')
    }
  })

  return doc.body.innerHTML
}
