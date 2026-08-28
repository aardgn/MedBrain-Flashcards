import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export type ReviewCard = {
  id: number | string
  question: string
  answer: string
  interval: number
}

export type ReviewData = {
  deckName: string
  userId: string
  cards: ReviewCard[]
}

export type ReviewDataResult = {
  data: ReviewData
  errorMessage: string | null
}

type ReviewCardRow = {
  id: number | string
  soru: string | null
  cevap: string | null
  aralik: number | string | null
}

function numberValue(value: number | string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function getReviewData(deckName: string): Promise<ReviewDataResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect('/')

  const cardsResult = await supabase
    .from('cards')
    .select('id, soru, cevap, aralik')
    .eq('ders', deckName)
    .lte('sonraki_tekrar', Date.now() / 1000)
    .order('id', { ascending: true })

  const rows = (cardsResult.data ?? []) as ReviewCardRow[]

  return {
    data: {
      deckName,
      userId: user.id,
      cards: rows.map((card) => ({
        id: card.id,
        question: card.soru?.trim() || 'Soru metni bulunamadı.',
        answer: card.cevap?.trim() || 'Cevap metni bulunamadı.',
        interval: numberValue(card.aralik),
      })),
    },
    errorMessage: cardsResult.error
      ? 'Review kartları şu anda yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.'
      : null,
  }
}
