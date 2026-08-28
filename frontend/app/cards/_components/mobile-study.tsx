'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { MobileBottomNavigation } from '@/app/_components/app-navigation'
import {
  DecksIcon,
  PlayIcon,
  StudyIcon,
} from '@/app/dashboard/_components/dashboard-icons'
import type { DeckSummary } from '@/lib/decks'
import type { StudyData } from '@/lib/study'

type MobileStudyProps = {
  data: StudyData
  errorMessage: string | null
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function DeckRow({ deck, index }: { deck: DeckSummary; index: number }) {
  const icons = ['🫀', '🧠', '🧬', '🫁', '🦴', '🩺']

  return (
    <article className="rounded-3xl border border-[#e2e6e0] bg-white p-4 shadow-[0_6px_22px_rgba(32,64,48,0.05)]">
      <div className="flex items-start gap-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ec] text-2xl" aria-hidden="true">
          {icons[index % icons.length]}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-bold" title={deck.name}>{deck.name}</h2>
          <p className="mt-1 text-sm text-[#737d78]">{deck.cardCount} cards</p>
        </div>
        <span className="text-sm font-semibold text-[#3f4f48]">{deck.progress}%</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e6e8e2]">
        <div className="h-full rounded-full bg-[#07563f]" style={{ width: `${deck.progress}%` }} />
      </div>

      <Link
        href={`/study/${encodeURIComponent(deck.name)}`}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#07563f] px-4 font-semibold text-white transition hover:bg-[#064733]"
      >
        {deck.progress === 0 ? <StudyIcon className="size-5" /> : <PlayIcon className="size-5" />}
        {deck.progress === 0 ? 'Start Study' : 'Continue'}
      </Link>
    </article>
  )
}

export function MobileStudy({ data, errorMessage }: MobileStudyProps) {
  const [search, setSearch] = useState('')
  const filteredDecks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR')
    if (!query) return data.decks
    return data.decks.filter((deck) => deck.name.toLocaleLowerCase('tr-TR').includes(query))
  }, [data.decks, search])

  return (
    <div className="min-h-screen bg-[#f8faf7] pb-28 text-[#111915] lg:hidden">
      <main className="mx-auto max-w-xl px-5 pb-8 pt-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
            <p className="mt-2 text-sm text-[#69736e]">Find a deck and continue studying.</p>
          </div>
          <Link href="/cards/new" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#07563f] text-2xl font-medium text-white" aria-label="Yeni deck oluştur">+</Link>
        </header>

        {errorMessage ? (
          <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {errorMessage}
          </div>
        ) : null}

        <label className="relative mt-6 block">
          <span className="sr-only">Deck ara</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#79837e]">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search decks"
            className="h-12 w-full rounded-2xl border border-[#dfe4dd] bg-white pl-12 pr-4 outline-none transition placeholder:text-[#9aa29e] focus:border-[#7fa08f] focus:ring-2 focus:ring-[#dfe9e2]"
          />
        </label>

        <section className="mt-6 space-y-4" aria-label="Deck listesi">
          {filteredDecks.length > 0 ? (
            filteredDecks.map((deck, index) => <DeckRow key={deck.name} deck={deck} index={index} />)
          ) : (
            <div className="rounded-3xl border border-dashed border-[#cad5cb] bg-white px-6 py-12 text-center">
              <DecksIcon className="mx-auto size-10 text-[#41745f]" />
              <p className="mt-3 font-bold">{data.decks.length === 0 ? 'Henüz bir deck yok' : 'Eşleşen deck bulunamadı'}</p>
              <p className="mt-1 text-sm text-[#69736e]">
                {data.decks.length === 0 ? 'Deck oluşturduğunda burada görünecek.' : 'Farklı bir arama terimi dene.'}
              </p>
            </div>
          )}
        </section>
      </main>

      <MobileBottomNavigation active="study" />
    </div>
  )
}
