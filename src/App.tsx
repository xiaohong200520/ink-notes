import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import Icon from './components/Icon'
import type { Note, Theme, ViewMode } from './types'
import { countWords, deriveTitle, uid } from './lib/note'
import { renderMarkdown } from './lib/markdown'
import { WELCOME_NOTE } from './lib/welcome'

const STORAGE_KEY = 'ink-notes:v1'

interface Workspace {
  notes: Note[]
  activeId: string | null
  theme: Theme
  view: ViewMode
}

function createNote(content = ''): Note {
  const ts = Date.now()
  return {
    id: uid(),
    title: deriveTitle(content),
    content,
    createdAt: ts,
    updatedAt: ts,
  }
}

function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Workspace>
      if (Array.isArray(parsed.notes)) {
        const notes = parsed.notes.filter(
          (note): note is Note => !!note && typeof note.id === 'string' && typeof note.content === 'string',
        )
        const activeId = notes.some((note) => note.id === parsed.activeId)
          ? (parsed.activeId as string)
          : (notes[0]?.id ?? null)
        return {
          notes,
          activeId,
          theme: parsed.theme === 'dark' ? 'dark' : parsed.theme === 'light' ? 'light' : prefersDark() ? 'dark' : 'light',
          view: parsed.view === 'edit' || parsed.view === 'preview' ? parsed.view : 'split',
        }
      }
    }
  } catch {
    // 本地数据损坏时回落到初始状态
  }

  const first = createNote(WELCOME_NOTE)
  const isNarrow = window.innerWidth <= 880
  return {
    notes: [first],
    activeId: first.id,
    theme: prefersDark() ? 'dark' : 'light',
    view: isNarrow ? 'edit' : 'split',
  }
}

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string; icon: 'pencil' | 'columns' | 'eye' }> = [
  { value: 'edit', label: '编辑', icon: 'pencil' },
  { value: 'split', label: '分栏', icon: 'columns' },
  { value: 'preview', label: '预览', icon: 'eye' },
]

export default function App() {
  const [ws, setWs] = useState<Workspace>(loadWorkspace)
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const firstRun = useRef(true)
  const fileRef = useRef<HTMLInputElement>(null)

  // 自动保存（防抖 350ms）
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setSaving(true)
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ws))
      } catch {
        setToast('浏览器存储已满，保存失败')
      }
      setSaving(false)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [ws])

  useEffect(() => {
    document.documentElement.dataset.theme = ws.theme
  }, [ws.theme])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const active = useMemo(
    () => ws.notes.find((note) => note.id === ws.activeId) ?? null,
    [ws.notes, ws.activeId],
  )

  const visibleNotes = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const sorted = [...ws.notes].sort((a, b) => b.updatedAt - a.updatedAt)
    if (!keyword) return sorted
    return sorted.filter(
      (note) =>
        note.title.toLowerCase().includes(keyword) || note.content.toLowerCase().includes(keyword),
    )
  }, [ws.notes, query])

  const html = useMemo(() => (active ? renderMarkdown(active.content) : ''), [active])
  const words = active ? countWords(active.content) : 0

  const handleCreate = useCallback(() => {
    const note = createNote('')
    setWs((prev) => ({ ...prev, notes: [note, ...prev.notes], activeId: note.id }))
    setQuery('')
    setSidebarOpen(false)
  }, [])

  const handleSelect = useCallback((id: string) => {
    setWs((prev) => ({ ...prev, activeId: id }))
    setSidebarOpen(false)
  }, [])

  const handleChange = useCallback((content: string) => {
    setWs((prev) => ({
      ...prev,
      notes: prev.notes.map((note) =>
        note.id === prev.activeId
          ? { ...note, content, title: deriveTitle(content), updatedAt: Date.now() }
          : note,
      ),
    }))
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      const target = ws.notes.find((note) => note.id === id)
      const name = target?.title || '这篇笔记'
      if (!window.confirm(`删除「${name}」？删除后无法恢复。`)) return

      setWs((prev) => {
        const remaining = prev.notes.filter((note) => note.id !== id)
        return {
          ...prev,
          notes: remaining,
          activeId: prev.activeId === id ? (remaining[0]?.id ?? null) : prev.activeId,
        }
      })
      setToast('已删除')
    },
    [ws.notes],
  )

  const handleToggleTask = useCallback((index: number) => {
    setWs((prev) => ({
      ...prev,
      notes: prev.notes.map((note) => {
        if (note.id !== prev.activeId) return note
        let cursor = -1
        const content = note.content.replace(/^(\s*[-*]\s\[)([ xX])(\])/gm, (match, head, mark, tail) => {
          cursor += 1
          if (cursor !== index) return match
          return `${head}${mark === ' ' ? 'x' : ' '}${tail}`
        })
        return { ...note, content, updatedAt: Date.now() }
      }),
    }))
  }, [])

  const handleExport = useCallback(() => {
    if (!active) return
    const blob = new Blob([active.content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${active.title.replace(/[\\/:*?"<>|]/g, '_') || 'note'}.md`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setToast('已导出 Markdown 文件')
  }, [active])

  const handleImport = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const loaded: Note[] = []

    for (const file of Array.from(files)) {
      const text = await file.text()
      const fallbackTitle = file.name.replace(/\.(md|markdown|txt)$/i, '')
      const note = createNote(text)
      loaded.push({ ...note, title: text.trim() ? note.title : fallbackTitle })
    }

    setWs((prev) => ({
      ...prev,
      notes: [...loaded, ...prev.notes],
      activeId: loaded[0]?.id ?? prev.activeId,
    }))
    setToast(`已导入 ${loaded.length} 篇笔记`)
  }, [])

  const setView = (view: ViewMode) => setWs((prev) => ({ ...prev, view }))
  const toggleTheme = () =>
    setWs((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        handleCreate()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleCreate])

  return (
    <div className={`app${sidebarOpen ? ' sidebar-open' : ''}`}>
      <Sidebar
        notes={visibleNotes}
        activeId={ws.activeId}
        query={query}
        theme={ws.theme}
        isOpen={sidebarOpen}
        onQueryChange={setQuery}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onThemeToggle={toggleTheme}
        onClose={() => setSidebarOpen(false)}
      />

      <button
        className="overlay"
        aria-label="关闭侧边栏"
        onClick={() => setSidebarOpen(false)}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <main className="main">
        <header className="topbar">
          <button className="icon-btn only-mobile" onClick={() => setSidebarOpen(true)} aria-label="打开侧边栏">
            <Icon name="menu" size={19} />
          </button>

          <div className="topbar__meta">
            <h1 className="doc-title">{active?.title ?? '墨记'}</h1>
            <p className="doc-sub">
              {active ? (
                <>
                  <span>{words} 字</span>
                  <span className="dot">·</span>
                  <span className={saving ? 'is-saving' : 'is-saved'}>{saving ? '保存中…' : '已自动保存'}</span>
                </>
              ) : (
                '本地 Markdown 笔记本'
              )}
            </p>
          </div>

          <div className="segmented" role="group" aria-label="视图切换">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`seg-btn${ws.view === option.value ? ' is-active' : ''}`}
                onClick={() => setView(option.value)}
                title={option.label}
              >
                <Icon name={option.icon} size={15} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="topbar__actions">
            <input
              ref={fileRef}
              type="file"
              accept=".md,.markdown,.txt,text/markdown,text/plain"
              multiple
              hidden
              onChange={(event) => {
                void handleImport(event.target.files)
                event.target.value = ''
              }}
            />
            <button className="icon-btn" title="导入 Markdown" onClick={() => fileRef.current?.click()}>
              <Icon name="plus" size={17} />
            </button>
            <button className="icon-btn" title="导出为 .md" onClick={handleExport} disabled={!active}>
              <Icon name="download" size={17} />
            </button>
            <button
              className="icon-btn is-danger"
              title="删除当前笔记"
              onClick={() => active && handleDelete(active.id)}
              disabled={!active}
            >
              <Icon name="trash" size={17} />
            </button>
          </div>
        </header>

        {active ? (
          <section className={`workspace workspace--${ws.view}`}>
            {ws.view !== 'preview' && (
              <Editor key={active.id} value={active.content} onChange={handleChange} />
            )}
            {ws.view !== 'edit' && <Preview html={html} onToggleTask={handleToggleTask} />}
          </section>
        ) : (
          <section className="empty">
            <div className="empty__mark">墨</div>
            <h2>还没有笔记</h2>
            <p>新建一篇，开始记录你的想法。</p>
            <button className="btn-new" onClick={handleCreate}>
              <Icon name="plus" size={16} />
              新建笔记
            </button>
          </section>
        )}

        <footer className="statusbar">
          <span>
            {active ? `${words} 字 · ${active.content.length} 字符` : '就绪'}
          </span>
          <span className="statusbar__hint">⌘/Ctrl + N 新建 · 数据仅保存在本地浏览器</span>
        </footer>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
