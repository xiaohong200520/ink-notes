import { useRef } from 'react'
import Icon from './Icon'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

interface TransformResult {
  text: string
  selStart: number
  selEnd: number
}

export default function Editor({ value, onChange }: EditorProps) {
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const applyTransform = (transform: (selected: string) => TransformResult) => {
    const el = areaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    const result = transform(selected)
    const next = value.slice(0, start) + result.text + value.slice(end)

    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + result.selStart, start + result.selEnd)
    })
  }

  const wrap = (before: string, after: string, placeholder: string) => () =>
    applyTransform((selected) => {
      const inner = selected || placeholder
      return {
        text: before + inner + after,
        selStart: before.length,
        selEnd: before.length + inner.length,
      }
    })

  const prefixLines = (prefix: string, placeholder: string) => () =>
    applyTransform((selected) => {
      const inner = selected || placeholder
      const text = inner
        .split('\n')
        .map((line) => (line.trim() ? prefix + line : line))
        .join('\n')
      return { text, selStart: 0, selEnd: text.length }
    })

  const insertBlock = (block: string) => () =>
    applyTransform(() => ({ text: block, selStart: block.length, selEnd: block.length }))

  const insertLink = () =>
    applyTransform((selected) => {
      const label = selected || '链接文字'
      const text = `[${label}](https://)`
      const urlStart = label.length + 3
      return { text, selStart: urlStart, selEnd: urlStart + 8 }
    })

  const actions: Array<{
    key: string
    label: string
    title: string
    run: () => void
    text?: string
    icon?: 'quote' | 'ul' | 'code' | 'link' | 'check' | 'table'
    className?: string
  }> = [
    {
      key: 'bold',
      label: 'B',
      title: '加粗 (⌘/Ctrl + B)',
      run: wrap('**', '**', '加粗文本'),
      className: 'is-bold',
    },
    {
      key: 'italic',
      label: 'I',
      title: '斜体 (⌘/Ctrl + I)',
      run: wrap('*', '*', '斜体文本'),
      className: 'is-italic',
    },
    {
      key: 'heading',
      label: 'H2',
      title: '二级标题',
      run: prefixLines('## ', '标题'),
      className: 'is-small',
    },
    {
      key: 'quote',
      label: '❝',
      title: '引用',
      run: prefixLines('> ', '引用内容'),
      className: 'is-quote',
    },
    { key: 'ul', label: '', title: '无序列表', run: prefixLines('- ', '列表项'), icon: 'ul' },
    { key: 'ol', label: '1.', title: '有序列表', run: prefixLines('1. ', '列表项'), className: 'is-small' },
    { key: 'code', label: '', title: '代码块', run: wrap('```\n', '\n```', 'code'), icon: 'code' },
    { key: 'link', label: '', title: '链接', run: insertLink, icon: 'link' },
    { key: 'task', label: '', title: '待办事项', run: insertBlock('- [ ] 待办事项\n'), icon: 'check' },
    {
      key: 'table',
      label: '',
      title: '表格',
      run: insertBlock('| 列 1 | 列 2 |\n| --- | --- |\n| 内容 | 内容 |\n'),
      icon: 'table',
    },
  ]

  return (
    <div className="pane pane--editor">
      <div className="toolbar" role="toolbar" aria-label="Markdown 格式工具">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            className={`tb-btn${action.className ? ` ${action.className}` : ''}`}
            title={action.title}
            aria-label={action.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={action.run}
          >
            {action.icon ? <Icon name={action.icon} size={16} /> : action.label}
          </button>
        ))}
      </div>

      <textarea
        ref={areaRef}
        className="editor-area"
        value={value}
        spellCheck={false}
        placeholder="从这里开始写……支持 Markdown 语法"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          const meta = event.metaKey || event.ctrlKey
          if (meta && event.key.toLowerCase() === 'b') {
            event.preventDefault()
            wrap('**', '**', '加粗文本')()
          } else if (meta && event.key.toLowerCase() === 'i') {
            event.preventDefault()
            wrap('*', '*', '斜体文本')()
          } else if (event.key === 'Tab') {
            event.preventDefault()
            const el = event.currentTarget
            const start = el.selectionStart
            const end = el.selectionEnd
            const next = `${value.slice(0, start)}  ${value.slice(end)}`
            onChange(next)
            requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2))
          }
        }}
      />
    </div>
  )
}
