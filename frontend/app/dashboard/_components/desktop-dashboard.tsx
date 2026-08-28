import Link from 'next/link'

import { DesktopSidebar } from '@/app/_components/app-navigation'
import type { DashboardData, DashboardDeck } from '@/lib/dashboard'

import {
  ArrowRightIcon,
  BellIcon,
  DecksIcon,
  FlameIcon,
  SparklesIcon,
  UploadIcon,
} from './dashboard-icons'

type DesktopDashboardProps = {
  data: DashboardData
  errorMessage: string | null
}

function DeckArtwork({ index }: { index: number }) {
  const styles = [
    'from-[#07543f] to-[#1b7a5e]',
    'from-[#6b907c] to-[#9eb6a8]',
    'from-[#4e806e] to-[#73a38f]',
  ]

  return (
    <div
      className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${styles[index % styles.length]} text-2xl text-white shadow-sm`}
      aria-hidden="true"
    >
      {index % 3 === 0 ? '🫀' : index % 3 === 1 ? '🧠' : '🧬'}
    </div>
  )
}

function ProgressBar({ deck }: { deck: DashboardDeck }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8e8df]">
        <div
          className="h-full rounded-full bg-[#07563f]"
          style={{ width: `${deck.progress}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="w-10 text-right text-sm font-medium text-[#52615b]">{deck.progress}%</span>
    </div>
  )
}

function EmptyDecks() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd8ce] bg-[#fafbf8] px-6 text-center">
      <DecksIcon className="mb-3 size-9 text-[#41745f]" />
      <p className="font-semibold text-[#16221d]">Henüz bir deck yok</p>
      <p className="mt-1 text-sm text-[#68746f]">İlk çalışma materyalini yükleyerek başlayabilirsin.</p>
    </div>
  )
}

export function DesktopDashboard({ data, errorMessage }: DesktopDashboardProps) {
  return (
    <div className="hidden min-h-screen bg-[#fbfcfa] text-[#111915] lg:flex">
      <DesktopSidebar
        active="dashboard"
        user={{ displayName: data.displayName, initials: data.initials }}
      />

      <div className="min-w-0 flex-1">
        <header className="flex h-24 items-center justify-end gap-7 border-b border-[#e7e9e3] bg-white/80 px-10">
          <div className="flex items-center gap-2.5 border-r border-[#e7e9e3] pr-7">
            <FlameIcon className="size-8 text-[#f26f21]" />
            <div>
              <p className="font-bold leading-tight">{data.streak}</p>
              <p className="text-sm text-[#5f6864]">day streak</p>
            </div>
          </div>
          <button className="rounded-full p-2 hover:bg-[#f1f3ef]" aria-label="Bildirimler">
            <BellIcon className="size-6" />
          </button>
          <div className="flex items-center gap-3 border-l border-[#e7e9e3] pl-7">
            <div className="flex size-11 items-center justify-center rounded-full bg-[#4c866e] font-semibold text-white">
              {data.initials}
            </div>
            <span className="max-w-36 truncate font-semibold">{data.firstName}</span>
          </div>
        </header>

        <main className="mx-auto max-w-[1460px] px-10 py-10 xl:px-16">
          {errorMessage ? (
            <div role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
              {errorMessage}
            </div>
          ) : null}

          <section className="relative flex min-h-44 items-start justify-between overflow-hidden px-4 py-5">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight text-[#101713] xl:text-5xl">
                Good morning, {data.firstName}! <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-5 text-lg text-[#59645f]">Keep up the great work! You&apos;re making steady progress.</p>
            </div>
            <div className="relative mr-8 hidden h-36 w-96 xl:block" aria-hidden="true">
              <div className="absolute bottom-2 right-10 h-20 w-20 rounded-full bg-[#edf1e8]" />
              <div className="absolute bottom-3 right-24 h-2 w-60 rounded-full bg-[#e3e8de]" />
              <div className="absolute bottom-5 right-28 text-7xl">🪴</div>
              <div className="absolute bottom-4 right-56 rotate-[-4deg] text-6xl">📚</div>
              <div className="absolute bottom-5 right-[20rem] text-5xl">☕</div>
            </div>
          </section>

          <section className="mb-7 flex items-center gap-5 rounded-3xl border border-[#e4e8e1] bg-white p-7 shadow-[0_8px_30px_rgba(32,64,48,0.06)]">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#fff0e8]">
              <FlameIcon className="size-9 text-[#f26f21]" />
            </div>
            <div>
              <p className="font-medium text-[#69736e]">Day Streak</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{data.streak}</span>
                <span className="text-[#65706b]">days</span>
              </div>
            </div>
          </section>

          <div className="grid gap-7 2xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.95fr)]">
            <section className="rounded-3xl border border-[#e4e8e1] bg-white p-7 shadow-[0_8px_30px_rgba(32,64,48,0.05)]">
              <h2 className="text-2xl font-bold">Continue Studying</h2>
              <div className="mt-5 space-y-3">
                {data.decks.length > 0 ? (
                  data.decks.map((deck, index) => (
                    <article key={deck.name} className="grid grid-cols-[auto_minmax(0,1fr)_minmax(90px,0.75fr)_auto] items-center gap-3 rounded-2xl border border-[#e6e8e2] p-3 xl:gap-5">
                      <DeckArtwork index={index} />
                      <div className="min-w-0">
                        <h3 className="truncate font-bold">{deck.name}</h3>
                        <p className="mt-1 text-sm text-[#68726d]">{deck.cardCount} cards</p>
                      </div>
                      <div className="min-w-0 self-center">
                        <ProgressBar deck={deck} />
                      </div>
                      <Link href="/cards" className="flex h-11 items-center gap-2 self-center whitespace-nowrap rounded-xl bg-[#07563f] px-4 font-medium text-white transition hover:bg-[#064735] xl:px-5">
                        Continue <ArrowRightIcon className="size-4" />
                      </Link>
                    </article>
                  ))
                ) : (
                  <EmptyDecks />
                )}
              </div>
              <Link href="/cards" className="mx-auto mt-5 flex w-fit items-center gap-2 font-semibold text-[#07563f]">
                View all decks <ArrowRightIcon className="size-4" />
              </Link>
            </section>

            <section className="rounded-3xl border border-[#e4e8e1] bg-white p-7 shadow-[0_8px_30px_rgba(32,64,48,0.05)]">
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <div className="mt-5 space-y-4">
                {[
                  { title: 'Upload Material', subtitle: 'PDF, PNG, JPG', href: '/cards/new', Icon: UploadIcon },
                  { title: 'My Decks', subtitle: 'View all your decks', href: '/cards', Icon: DecksIcon },
                  { title: 'AI Tutor', subtitle: 'Ask anything', href: '/', Icon: SparklesIcon },
                ].map(({ title, subtitle, href, Icon }) => (
                  <Link key={title} href={href} className="flex items-center gap-5 rounded-2xl border border-[#e6e8e2] p-5 transition hover:border-[#bbcabf] hover:bg-[#fbfcf9]">
                    <Icon className="size-10 shrink-0 text-[#07563f]" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{title}</p>
                      <p className="mt-1 text-sm text-[#6d7772]">{subtitle}</p>
                    </div>
                    <ArrowRightIcon className="size-5" />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <blockquote className="relative mt-7 overflow-hidden rounded-3xl border border-[#e4e8e1] bg-[#fbfaf4] px-10 py-8 shadow-[0_8px_30px_rgba(32,64,48,0.04)]">
            <span className="absolute -left-1 top-0 font-serif text-8xl text-[#bbc8ae]" aria-hidden="true">“</span>
            <div className="relative ml-12">
              <p className="text-lg font-semibold">The expert in anything was once a beginner.</p>
              <footer className="mt-2 text-[#68726d]">— Helen Hayes</footer>
            </div>
            <div className="absolute bottom-0 right-0 h-16 w-1/2 bg-[radial-gradient(ellipse_at_bottom,#dfe6d4,transparent_68%)]" aria-hidden="true" />
          </blockquote>
        </main>
      </div>
    </div>
  )
}
