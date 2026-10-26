import { useRef } from 'react'

interface PreviewProps {
  html: string
  onToggleTask: (index: number) => void
}

export default function Preview({ html, onToggleTask }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className="pane pane--preview"
      ref={containerRef}
      onClick={(event) => {
        const target = event.target
        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
          const boxes = Array.from(
            containerRef.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [],
          )
          const index = boxes.indexOf(target)
          if (index >= 0) {
            onToggleTask(index)
          }
        }
      }}
    >
      {html.trim() ? (
        <article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="preview-empty">预览会显示在这里</p>
      )}
    </div>
  )
}
