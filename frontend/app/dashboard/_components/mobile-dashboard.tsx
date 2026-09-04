import Link from 'next/link'

import { MobileBottomNavigation } from '@/app/_components/app-navigation'
import type { DashboardData, DashboardDeck } from '@/lib/dashboard'

import {
  ArrowRightIcon,
  BellIcon,
  DecksIcon,
  FlameIcon,
  LogoIcon,
  PlayIcon,
  SparklesIcon,
  UploadIcon,
} from './dashboard-icons'

type MobileDashboardProps = {
  data: DashboardData
  errorMessage: string | null
}

function MobileProgress({ deck }: { deck: DashboardDeck }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e4e5dd]">
        <div className="h-full rounded-full bg-[#07563f]" style={{ width: `${deck.progress}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-[#4f5955]">{deck.progress}%</span>
    </div>
  )
}

function FeaturedDeck({ deck }: { deck: DashboardDeck | undefined }) {
  if (!deck) {
    return (
      <div className="rounded-3xl border border-dashed border-[#cfd8ce] bg-[#f8faf5] px-6 py-10 text-center">
        <DecksIcon className="mx-auto size-9 text-[#41745f]" />
        <p className="mt-3 font-bold">Henüz bir deck yok</p>
        <p className="mt-1 text-sm text-[#69736e]">Materyal yükleyerek ilk deck&apos;ini oluşturabilirsin.</p>
      </div>
    )
  }

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#e4e8df] bg-[linear-gradient(120deg,#f7faf4,#f4f7ef)] p-5 shadow-[0_8px_25px_rgba(32,64,48,0.08)]">
      <div className="absolute right-5 top-8 text-7xl opacity-90" aria-hidden="true">🫀</div>
      <span className="inline-flex rounded-full bg-[#e2efe2] px-3 py-1 text-xs font-semibold text-[#176044]">In Progress</span>
      <div className="relative mt-3 max-w-[72%]">
        <h3 className="truncate text-xl font-bold">{deck.name}</h3>
        <p className="mt-2 text-sm text-[#56625d]">{deck.cardCount} cards</p>
      </div>
      <div className="mt-5 max-w-[76%]">
        <MobileProgress deck={deck} />
      </div>
      <Link href="/cards" className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-[#07563f] px-4 py-3.5 font-semibold text-white shadow-sm">
        <PlayIcon className="size-5" /> Continue Session
      </Link>
    </article>
  )
}

export function MobileDashboard({ data, errorMessage }: MobileDashboardProps) {
  const featuredDeck = data.decks[0]
  const hasActiveStreak = data.streak > 0
  const recentDecks = data.decks.slice(0, 3)

  return (
    <div className="min-h-screen bg-white pb-28 text-[#111915] lg:hidden">
      <main className="mx-auto max-w-xl px-5 pb-8 pt-7">
        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#07563f]">
            <LogoIcon className="size-10" />
            <span className="font-serif text-3xl font-bold">Medonie</span>
          </Link>
          <button className="rounded-full p-2" aria-label="Bildirimler">
            <BellIcon className="size-6" />
          </button>
        </header>

        {errorMessage ? (
          <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {errorMessage}
          </div>
        ) : null}

        <section className="mt-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Hi {data.firstName} <span aria-hidden="true">👋</span></h1>
              <p className="mt-2 text-[#58635e]">Let&apos;s keep building your knowledge.</p>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${hasActiveStreak ? 'bg-[#fff4eb] text-[#6f3a20]' : 'bg-[#eef0ed] text-[#747d78]'}`}>
              <FlameIcon className={`size-5 ${hasActiveStreak ? 'text-[#f26f21]' : 'text-[#9ca39f]'}`} /> {data.streak} day streak
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Continue Studying</h2>
          <FeaturedDeck deck={featuredDeck} />
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { title: 'Upload Material', subtitle: 'PDF, PNG, JPG', href: '/cards/new', Icon: UploadIcon, disabled: false },
              { title: 'My Decks', subtitle: 'View all decks', href: '/cards', Icon: DecksIcon, disabled: false },
              { title: 'AI Tutor', subtitle: 'Coming soon', href: '', Icon: SparklesIcon, disabled: true },
            ].map(({ title, subtitle, href, Icon, disabled }) => {
              const content = (
                <>
                  <Icon className={`size-8 ${disabled ? 'text-[#9aa29e]' : 'text-[#07563f]'}`} />
                  <p className="mt-4 text-sm font-bold leading-tight">{title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#727b77]">{subtitle}</p>
                  {disabled ? (
                    <span className="mt-auto self-end rounded-full bg-[#eef0ed] px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-[#77807b]">Soon</span>
                  ) : (
                    <ArrowRightIcon className="mt-auto ml-auto size-4" />
                  )}
                </>
              )

              return disabled ? (
                <div key={title} aria-disabled="true" className="flex min-h-36 cursor-not-allowed flex-col rounded-2xl border border-[#e6e8e2] bg-[#fafbf9] p-3.5 text-[#8a928e] opacity-75 shadow-[0_5px_18px_rgba(32,64,48,0.04)]">
                  {content}
                </div>
              ) : (
                <Link key={title} href={href} className="flex min-h-36 flex-col rounded-2xl border border-[#e6e8e2] bg-white p-3.5 shadow-[0_5px_18px_rgba(32,64,48,0.05)]">
                  {content}
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Decks</h2>
            <Link href="/cards" className="text-sm font-semibold text-[#07563f]">View all</Link>
          </div>
          {recentDecks.length > 0 ? (
            <div className="space-y-2.5">
              {recentDecks.map((deck, index) => (
                <Link key={deck.name} href="/cards" className="grid grid-cols-[auto_minmax(0,1fr)_88px_auto] items-center gap-3 rounded-2xl border border-[#e6e8e2] p-3 shadow-[0_4px_14px_rgba(32,64,48,0.04)]">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#f6efec] text-2xl" aria-hidden="true">
                    {index % 3 === 0 ? '🫀' : index % 3 === 1 ? '🧠' : '🧬'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold">{deck.name}</h3>
                    <p className="mt-1 text-xs text-[#747d79]">{deck.cardCount} cards</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">{deck.progress}%</p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#e4e5dd]">
                      <div className="h-full rounded-full bg-[#07563f]" style={{ width: `${deck.progress}%` }} />
                    </div>
                  </div>
                  <ArrowRightIcon className="size-4" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#cfd8ce] px-4 py-7 text-center text-sm text-[#69736e]">Deck listesi henüz boş.</p>
          )}
        </section>
      </main>

      <MobileBottomNavigation active="dashboard" />
    </div>
  )
}
