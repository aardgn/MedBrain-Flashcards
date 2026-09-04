import Link from 'next/link'

import {
  ArrowRightIcon,
  DashboardIcon,
  LogoIcon,
  StatsIcon,
  StudyIcon,
  TutorIcon,
} from '@/app/dashboard/_components/dashboard-icons'

export type NavigationSection = 'dashboard' | 'study' | 'stats' | 'tutor'

type UserIdentity = {
  displayName: string
  initials: string
}

const navigationItems = [
  { id: 'dashboard' as const, label: 'Dashboard', href: '/dashboard', Icon: DashboardIcon, disabled: false },
  { id: 'study' as const, label: 'Study', href: '/cards', Icon: StudyIcon, disabled: false },
  { id: 'stats' as const, label: 'Stats', href: '/stats', Icon: StatsIcon, disabled: false },
  { id: 'tutor' as const, label: 'Tutor', href: '', Icon: TutorIcon, disabled: true },
]

export function DesktopSidebar({
  active,
  user,
}: {
  active: NavigationSection
  user: UserIdentity
}) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-[#e7e9e3] bg-[#fdfefc] px-6 py-7">
      <Link href="/dashboard" className="flex items-center gap-3 text-[#07563f]">
        <LogoIcon className="size-11" />
        <span className="font-serif text-4xl font-bold tracking-tight">Medonie</span>
      </Link>

      <nav className="mt-16 space-y-3" aria-label="Ana navigasyon">
        {navigationItems.map(({ id, label, href, Icon, disabled }) => {
          const isActive = id === active

          if (disabled) {
            return (
              <div
                key={id}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-[#8b938f]"
              >
                <Icon className="size-6" />
                <span>{label}</span>
                <span className="ml-auto rounded-full bg-[#eef0ed] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#77807b]">
                  Coming soon
                </span>
              </div>
            )
          }

          return (
            <Link
              key={id}
              href={href}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 font-semibold transition ${
                isActive
                  ? 'bg-[#eef1e9] text-[#07563f]'
                  : 'text-[#111915] hover:bg-[#f3f5f0]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-6" /> {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-[#e2e6df] bg-white p-4 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-full bg-[#4c866e] font-semibold text-white">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{user.displayName}</p>
            <p className="text-sm text-[#727c77]">Free Plan</p>
          </div>
          <ArrowRightIcon className="size-4 text-[#77817c]" />
        </div>
      </div>
    </aside>
  )
}

export function MobileBottomNavigation({ active }: { active: NavigationSection }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-xl grid-cols-4 rounded-t-[2rem] bg-[#07563f] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-white shadow-[0_-8px_24px_rgba(7,86,63,0.18)]"
      aria-label="Mobil navigasyon"
    >
      {navigationItems.map(({ id, label, href, Icon, disabled }) => {
        const isActive = id === active

        if (disabled) {
          return (
            <div
              key={id}
              aria-disabled="true"
              className="flex cursor-not-allowed flex-col items-center gap-0.5 text-white/40"
            >
              <Icon className="size-6" />
              <span className="text-xs">{label}</span>
              <span className="text-[8px] font-bold uppercase tracking-wide">Soon</span>
            </div>
          )
        }

        return (
          <Link
            key={id}
            href={href}
            className={`flex flex-col items-center gap-1 text-xs ${isActive ? 'text-white' : 'text-white/65'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="size-6" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
