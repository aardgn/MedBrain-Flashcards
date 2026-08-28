'use client'

import Link from 'next/link'
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { ReviewCard, ReviewData } from '@/lib/review'
import { calculateNextReview, type ReviewResult } from '@/lib/srs'

type ReviewSessionProps = {
  initialData: ReviewData
  initialError: string | null
}

const FLIP_TRANSITION_MS = 700

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function DeckArtwork({ deckName }: { deckName: string }) {
  const icons = ['🫀', '🧠', '🧬', '🫁', '🦴', '🩺']
  const hash = Array.from(deckName).reduce((total, character) => total + character.codePointAt(0)!, 0)

  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#e7f0e9] text-3xl" aria-hidden="true">
      {icons[hash % icons.length]}
    </div>
  )
}

function DeleteButton({ onDelete, disabled }: { onDelete: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#7a504b] transition hover:bg-[#fff0ec] disabled:cursor-wait disabled:opacity-50"
      aria-label="Bu kartı sil"
    >
      <TrashIcon />
      <span>Delete card</span>
    </button>
  )
}

function StackLayers({ count }: { count: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-full" aria-hidden="true">
      {count >= 2 ? <div className="absolute inset-x-7 -top-5 bottom-5 rounded-[2rem] border border-[#dde5dc] bg-[#edf3ec] shadow-sm" /> : null}
      {count >= 1 ? <div className="absolute inset-x-3 -top-2.5 bottom-2.5 rounded-[2rem] border border-[#dce4db] bg-[#f6f8f4] shadow-sm" /> : null}
    </div>
  )
}

function ReviewCardView({
  card,
  isPending,
  onRate,
  onDelete,
  onAdvance,
  onRemove,
}: {
  card: ReviewCard
  isPending: boolean
  onRate: (card: ReviewCard, result: ReviewResult) => Promise<boolean>
  onDelete: (card: ReviewCard) => Promise<boolean>
  onAdvance: () => void
  onRemove: (cardId: ReviewCard['id']) => void
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isDisabled = isPending || isTransitioning

  async function resetFlipBefore(action: () => void) {
    setIsFlipped(false)
    await new Promise((resolve) => window.setTimeout(resolve, FLIP_TRANSITION_MS))
    action()
  }

  async function handleRate(result: ReviewResult) {
    setIsTransitioning(true)
    const wasSaved = await onRate(card, result)

    if (!wasSaved) {
      setIsTransitioning(false)
      return
    }

    await resetFlipBefore(onAdvance)
  }

  async function handleDelete() {
    setIsTransitioning(true)
    const wasDeleted = await onDelete(card)

    if (!wasDeleted) {
      setIsTransitioning(false)
      return
    }

    await resetFlipBefore(() => onRemove(card.id))
  }

  return (
    <div
      className={`relative h-[clamp(500px,65vh,620px)] w-full transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
    >
      <article className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] border border-[#dce5dc] bg-white p-5 shadow-[0_22px_65px_rgba(32,64,48,0.12)] [backface-visibility:hidden] sm:p-8">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-1 py-6 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#668072]">Question</p>
          <h2 className="mt-6 whitespace-pre-wrap text-xl font-semibold leading-relaxed sm:text-2xl">{card.question}</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsFlipped(true)}
          disabled={isDisabled}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#07563f] px-5 font-semibold text-white transition hover:bg-[#064733] disabled:cursor-wait disabled:opacity-60 sm:mx-auto sm:w-auto sm:min-w-52"
        >
          See the Answer
        </button>
        <div className="mt-3 flex justify-center">
          <DeleteButton onDelete={handleDelete} disabled={isDisabled} />
        </div>
      </article>

      <article className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] border border-[#dce5dc] bg-white p-5 shadow-[0_22px_65px_rgba(32,64,48,0.12)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-1 py-5 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#668072]">Answer</p>
          <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-[#25342e] sm:text-xl">{card.answer}</p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <button type="button" disabled={isDisabled} onClick={() => handleRate('Bilemedim')} className="h-12 rounded-xl border border-[#e7bdb5] bg-[#fff2ef] px-4 font-semibold text-[#8a3f35] transition hover:bg-[#ffe7e2] disabled:cursor-wait disabled:opacity-60">Bilemedim</button>
          <button type="button" disabled={isDisabled} onClick={() => handleRate('Zordu')} className="h-12 rounded-xl border border-[#e4d4a8] bg-[#fff9e9] px-4 font-semibold text-[#735d22] transition hover:bg-[#fff3cf] disabled:cursor-wait disabled:opacity-60">Zordu</button>
          <button type="button" disabled={isDisabled} onClick={() => handleRate('Kolaydı')} className="h-12 rounded-xl bg-[#07563f] px-4 font-semibold text-white transition hover:bg-[#064733] disabled:cursor-wait disabled:opacity-60">Kolaydı</button>
        </div>
        <div className="mt-3 flex justify-center">
          <DeleteButton onDelete={handleDelete} disabled={isDisabled} />
        </div>
      </article>
    </div>
  )
}

function Completion({ deckName, hadCards }: { deckName: string; hadCards: boolean }) {
  return (
    <section className="mx-auto mt-14 flex min-h-[430px] max-w-2xl flex-col items-center justify-center rounded-[2rem] border border-[#dfe6de] bg-white px-6 text-center shadow-[0_20px_60px_rgba(32,64,48,0.08)]">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#e4f0e7] text-[#07563f]">
        <CheckIcon />
      </div>
      <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
        {hadCards ? 'Tebrikler, bugünkü review’lar bitti!' : 'Şu an tekrar sırası gelmiş kart yok.'}
      </h2>
      <p className="mt-3 max-w-md text-[#68736e]">
        {hadCards
          ? `${deckName} deck’indeki due kartları tamamladın.`
          : `${deckName} deck’i için daha sonra tekrar kontrol edebilirsin.`}
      </p>
      <Link href="/cards" className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#07563f] px-6 font-semibold text-white transition hover:bg-[#064733]">
        Decks&apos;e dön
      </Link>
    </section>
  )
}

export function ReviewSession({ initialData, initialError }: ReviewSessionProps) {
  const [cards, setCards] = useState(initialData.cards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPending, setIsPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const hadCardsAtStart = initialData.cards.length > 0
  const sessionTotal = cards.length
  const currentCard = cards[currentIndex]

  async function rateCard(card: ReviewCard, result: ReviewResult) {
    setIsPending(true)
    setActionError(null)

    try {
      const nowInSeconds = Date.now() / 1000
      const nextReview = calculateNextReview(card.interval, result, nowInSeconds)
      const supabase = createClient()
      const [cardUpdate, reviewLog] = await Promise.all([
        supabase
          .from('cards')
          .update({
            aralik: nextReview.interval,
            sonraki_tekrar: nextReview.nextReviewAt,
          })
          .eq('id', card.id),
        supabase.from('review_logs').insert({
          user_id: initialData.userId,
          card_id: card.id,
          sonuc: result,
          created_at: new Date(nowInSeconds * 1000).toISOString(),
        }),
      ])

      if (cardUpdate.error || reviewLog.error) {
        setActionError('Review kaydedilemedi. Kartta kalındı; lütfen tekrar deneyin.')
        return false
      }

      return true
    } catch {
      setActionError('Review kaydedilirken bağlantı hatası oluştu. Lütfen tekrar deneyin.')
      return false
    } finally {
      setIsPending(false)
    }
  }

  async function deleteCard(card: ReviewCard) {
    setIsPending(true)
    setActionError(null)

    try {
      const supabase = createClient()
      const deleteResult = await supabase.from('cards').delete().eq('id', card.id)

      if (deleteResult.error) {
        setActionError('Kart silinemedi. Lütfen tekrar deneyin.')
        return false
      }

      return true
    } catch {
      setActionError('Kart silinirken bağlantı hatası oluştu. Lütfen tekrar deneyin.')
      return false
    } finally {
      setIsPending(false)
    }
  }

  const completed = !currentCard
  const visualCardsBehind = completed ? 0 : Math.min(2, cards.length - currentIndex - 1)

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-6 text-[#111915] sm:px-8 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/cards" className="inline-flex items-center gap-1 rounded-lg py-2 pr-3 text-sm font-semibold text-[#527064] transition hover:bg-[#edf2ed] hover:text-[#07563f]">
          <ArrowLeftIcon /> Back to decks
        </Link>

        <header className="mt-4 flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <DeckArtwork deckName={initialData.deckName} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7872]">Review session</p>
              <h1 className="mt-1 truncate text-xl font-bold sm:text-3xl" title={initialData.deckName}>{initialData.deckName}</h1>
            </div>
          </div>
          <div className="shrink-0 rounded-full border border-[#dbe4da] bg-white px-4 py-2 text-base font-bold text-[#07563f] shadow-sm" aria-label={`Kart ${completed ? sessionTotal : Math.min(currentIndex + 1, sessionTotal)} / ${sessionTotal}`}>
            {completed ? sessionTotal : Math.min(currentIndex + 1, sessionTotal)} <span className="text-[#9aa49f]">/</span> {sessionTotal}
          </div>
        </header>

        {initialError ? (
          <div role="alert" className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
            {initialError}
          </div>
        ) : null}

        {actionError ? (
          <div role="alert" className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-900">
            {actionError}
          </div>
        ) : null}

        {initialError ? null : completed ? (
          <Completion deckName={initialData.deckName} hadCards={hadCardsAtStart} />
        ) : (
          <section className="mx-auto mt-14 max-w-2xl sm:mt-16" aria-live="polite">
            <div className="relative [perspective:1200px]">
              <StackLayers count={visualCardsBehind} />

              <ReviewCardView
                key={currentCard.id}
                card={currentCard}
                isPending={isPending}
                onRate={rateCard}
                onDelete={deleteCard}
                onAdvance={() => setCurrentIndex((index) => index + 1)}
                onRemove={(cardId) => {
                  setCards((currentCards) => currentCards.filter((card) => card.id !== cardId))
                }}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
