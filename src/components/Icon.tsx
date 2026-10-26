import type { ReactNode } from 'react'

export type IconName =
  | 'menu'
  | 'plus'
  | 'search'
  | 'trash'
  | 'download'
  | 'sun'
  | 'moon'
  | 'pencil'
  | 'columns'
  | 'eye'
  | 'quote'
  | 'ul'
  | 'code'
  | 'link'
  | 'check'
  | 'table'
  | 'close'

const paths: Record<IconName, ReactNode> = {
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.2 7l.9 12.1a1.5 1.5 0 0 0 1.5 1.4h6.8a1.5 1.5 0 0 0 1.5-1.4L18 7" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="M8 11l4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.8 6.8 0 0 0 11 11z" />,
  pencil: (
    <>
      <path d="M4 20l4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z" />
      <path d="M14 6.5l3 3" />
    </>
  ),
  columns: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M12 5v14" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  quote: (
    <>
      <path d="M9 7H6.5A2.5 2.5 0 0 0 4 9.5v1A2.5 2.5 0 0 0 6.5 13H8v1.5A2.5 2.5 0 0 1 5.5 17" />
      <path d="M19 7h-2.5A2.5 2.5 0 0 0 14 9.5v1a2.5 2.5 0 0 0 2.5 2.5H18v1.5A2.5 2.5 0 0 1 15.5 17" />
    </>
  ),
  ul: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  code: (
    <>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.2 1.2" />
      <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.2-1.2" />
    </>
  ),
  check: (
    <>
      <rect x="3.5" y="4.5" width="6" height="6" rx="1.2" />
      <path d="M4.8 7.4l1.3 1.3 2.2-2.4" />
      <path d="M13 7.5h7.5" />
      <path d="M13 13h7.5" />
      <path d="M3.5 13.5h6v6h-6z" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M9 10v9M15 10v9" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export default function Icon({ name, size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
