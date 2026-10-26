import Icon from './Icon'
import type { Note, Theme } from '../types'
import { formatTime, toSnippet } from '../lib/note'

interface SidebarProps {
  notes: Note[]
  activeId: string | null
  query: string
  theme: Theme
  isOpen: boolean
  onQueryChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onThemeToggle: () => void
  onClose: () => void
}

export default function Sidebar({
  notes,
  activeId,
  query,
  theme,
  isOpen,
  onQueryChange,
  onSelect,
  onCreate,
  onDelete,
  onThemeToggle,
  onClose,
}: SidebarProps) {
  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`}>
      <div className="sidebar__brand">
        <span className="brand-mark">墨</span>
        <span className="brand-text">
          <strong>墨记</strong>
          <small>Markdown Notes</small>
        </span>
        <button className="sidebar__close only-mobile" onClick={onClose} aria-label="关闭侧边栏">
          <Icon name="close" size={16} />
        </button>
      </div>

      <div className="search-wrap">
        <Icon name="search" size={15} />
        <input
          className="search-input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="搜索标题或内容"
          aria-label="搜索笔记"
        />
        {query && (
          <button className="search-clear" onClick={() => onQueryChange('')} aria-label="清空搜索">
            <Icon name="close" size={13} />
          </button>
        )}
      </div>

      <button className="btn-new" onClick={onCreate}>
        <Icon name="plus" size={16} />
        新建笔记
      </button>

      <div className="note-list">
        {notes.length === 0 && (
          <p className="note-list__empty">{query ? '没有匹配的笔记' : '还没有笔记'}</p>
        )}
        {notes.map((note) => {
          const snippet = toSnippet(note.content.replace(/^#\s+.+$/m, ''))
          return (
            <div
              key={note.id}
              className={`note-item${note.id === activeId ? ' is-active' : ''}`}
              onClick={() => onSelect(note.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(note.id)
                }
              }}
            >
              <div className="note-item__body">
                <p className="note-item__title">{note.title}</p>
                <p className="note-item__snippet">{snippet || '空白笔记'}</p>
                <span className="note-item__time">{formatTime(note.updatedAt)}</span>
              </div>
              <button
                className="note-item__delete"
                title="删除笔记"
                aria-label={`删除 ${note.title}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(note.id)
                }}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="sidebar__footer">
        <span className="note-count">共 {notes.length} 篇</span>
        <button className="theme-toggle" onClick={onThemeToggle} title="切换主题">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          <span>{theme === 'dark' ? '浅色' : '深色'}</span>
        </button>
      </div>
    </aside>
  )
}
