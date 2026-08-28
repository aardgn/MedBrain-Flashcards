import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export function LogoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.5 5.2a3 3 0 0 0-5.4 1.9v.5a3.2 3.2 0 0 0-.6 5.8 3.1 3.1 0 0 0 2.7 4.8 3 3 0 0 0 3.3 1.3V5.2Z" />
      <path d="M14.5 5.2a3 3 0 0 1 5.4 1.9v.5a3.2 3.2 0 0 1 .6 5.8 3.1 3.1 0 0 1-2.7 4.8 3 3 0 0 1-3.3 1.3V5.2Z" />
      <path d="M7 8.5c1.4 0 2.5 1.1 2.5 2.5M17 8.5A2.5 2.5 0 0 0 14.5 11M6.4 14c1.7 0 3.1 1.4 3.1 3.1M17.6 14a3.1 3.1 0 0 0-3.1 3.1" />
    </IconBase>
  )
}

export function DashboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </IconBase>
  )
}

export function StudyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16ZM7 8h1.5M15.5 8H17" />
    </IconBase>
  )
}

export function StatsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M2 20h20" />
    </IconBase>
  )
}

export function TutorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.5 19.5C5.2 18.2 3 15.4 3 12c0-4.4 4-8 9-8s9 3.6 9 8-4 8-9 8c-.9 0-1.8-.1-2.6-.4L6 21l2.5-1.5Z" />
      <path d="M8.5 10h.01M12 8h.01M15.5 10h.01M10 14c1.2 1 2.8 1 4 0" />
    </IconBase>
  )
}

export function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7" />
      <path d="M14 3v5h5M12 14h8M16 10v8" />
    </IconBase>
  )
}

export function DecksIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 8h13a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      <path d="M6 8V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8h-2M7 12h8" />
    </IconBase>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
    </IconBase>
  )
}

export function FlameIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M13.5 2.5c.6 4-3.5 5.2-2.3 8.8.4 1.2 1.3 1.8 2.3 2.2-.2-1.8.8-3.1 2.2-4.3 1.8 1.8 3.3 3.8 3.3 6.5A7 7 0 0 1 5 15.5c0-4.8 3.8-8 8.5-13Z" />
    </IconBase>
  )
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3ZM6 13l1.1 2.9L10 17l-2.9 1.1L6 21l-1.1-2.9L2 17l2.9-1.1L6 13ZM18 12l.8 2.2 2.2.8-2.2.8L18 18l-.8-2.2L15 15l2.2-.8L18 12Z" />
    </IconBase>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </IconBase>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M8 5.5v13a1 1 0 0 0 1.55.83l9.2-6.5a1 1 0 0 0 0-1.66l-9.2-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  )
}
