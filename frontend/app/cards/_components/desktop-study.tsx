import Link from 'next/link'

import { DesktopSidebar } from '@/app/_components/app-navigation'
import {
  ArrowRightIcon,
  DecksIcon,
  PlayIcon,
  StudyIcon,
} from '@/app/dashboard/_components/dashboard-icons'
import type { DeckSummary } from '@/lib/decks'
import type { StudyData } from '@/lib/study'

type DesktopStudyProps = {
  data: StudyData
  errorMessage: string | null
}

function DeckArtwork({ index }: { index: number }) {
  const styles = [
    'bg-[#e7f0e9]',
    'bg-[#f3ece9]',
    'bg-[#e9edf4]',
    'bg-[#f2efe2]',
    'bg-[#e9f1ef]',
    'bg-[#f1eaf2]',
  ]
  const icons = ['🫀', '🧠', '🧬', '🫁', '🦴', '🩺']

  return (
    <div className={`flex size-14 items-center justify-center rounded-2xl text-3xl ${styles[index % styles.length]}`} aria-hidden="true">
      {icons[index % icons.length]}
    </div>
  )
}

function Progress({ deck }: { deck: DeckSummary }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[#69736e]">Progress</span>
        <span className="font-semibold text-[#34433d]">{deck.progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e7e9e2]">
        <div className="h-full rounded-full bg-[#07563f]" style={{ width: `${deck.progress}%` }} />
      </div>
    </div>
  )
}

function EmptyDecks() {
  return (
    <div className="col-span-full flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-[#cad5cb] bg-white px-6 text-center">
      <DecksIcon className="size-12 text-[#41745f]" />
      <h2 className="mt-4 text-xl font-bold">Henüz bir deck yok</h2>
      <p className="mt-2 max-w-md text-sm text-[#69736e]">İlk çalışma materyalini eklediğinde deck&apos;lerin burada görünecek.</p>
    </div>
  )
}

export function DesktopStudy({ data, errorMessage }: DesktopStudyProps) {
  return (
    <div className="hidden min-h-screen bg-[#f8faf7] text-[#111915] lg:flex">
      <DesktopSidebar
        active="study"
        user={{ displayName: data.displayName, initials: data.initials }}
      />

      <main className="min-w-0 flex-1 px-8 py-10 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-[1460px]">
          {errorMessage ? (
            <div role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
              {errorMessage}
            </div>
          ) : null}

          <header className="flex items-start justify-between gap-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">Study</h1>
              <p className="mt-3 text-lg text-[#68736e]">Continue your decks or create new ones.</p>
            </div>
            <Link
              href="/cards/new"
              className="flex h-12 items-center gap-2 rounded-xl bg-[#07563f] px-5 font-semibold text-white transition hover:bg-[#064733]"
            >
              <span className="text-xl leading-none">+</span> Create New Deck
            </Link>
          </header>

          <nav className="mt-10 flex gap-2 border-b border-[#dde2dc]" aria-label="Deck filtreleri">
            <button type="button" className="border-b-2 border-[#07563f] px-5 py-3 font-semibold text-[#07563f]" aria-current="page">
              All Decks
            </button>
            {['My Decks', 'Shared', 'Favorites'].map((label) => (
              <button key={label} type="button" disabled title="Yakında" className="cursor-not-allowed px-5 py-3 font-medium text-[#a0a7a3]">
                {label}
              </button>
            ))}
          </nav>

          <section className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3" aria-label="Deck listesi">
            {data.decks.length > 0 ? (
              data.decks.map((deck, index) => (
                <article key={deck.name} className="flex min-h-72 flex-col rounded-3xl border border-[#e0e5de] bg-white p-5 shadow-[0_8px_28px_rgba(32,64,48,0.05)]">
                  <div className="flex items-start gap-4">
                    <DeckArtwork index={index} />
                    <div className="min-w-0 flex-1 pt-1">
                      <h2 className="truncate text-lg font-bold" title={deck.name}>{deck.name}</h2>
                      <p className="mt-1 text-sm text-[#707a75]">{deck.cardCount} cards</p>
                    </div>
                  </div>

                  <div className="mt-7">
                    <Progress deck={deck} />
                  </div>

                  <Link
                    href={`/study/${encodeURIComponent(deck.name)}`}
                    className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-[#07563f] px-4 font-semibold text-white transition hover:bg-[#064733]"
                  >
                    {deck.progress === 0 ? <StudyIcon className="size-5" /> : <PlayIcon className="size-5" />}
                    {deck.progress === 0 ? 'Start Study' : 'Continue'}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </article>
              ))
            ) : (
              <EmptyDecks />
            )}
          </section>

          <section className="mt-8 grid grid-cols-2 gap-5 rounded-3xl border border-[#e0e5de] bg-white p-6 shadow-[0_8px_28px_rgba(32,64,48,0.04)]" aria-label="Deck özeti">
            <div className="border-r border-[#e3e6e1] text-center">
              <p className="text-sm font-medium text-[#707a75]">Total Decks</p>
              <p className="mt-1 text-3xl font-bold text-[#07563f]">{data.decks.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#707a75]">Total Cards</p>
              <p className="mt-1 text-3xl font-bold text-[#07563f]">{data.totalCards}</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
