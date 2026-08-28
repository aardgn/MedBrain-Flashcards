import { redirect } from 'next/navigation'

import { buildDecks, type DeckCardRow, type DeckSummary } from '@/lib/decks'
import { createClient } from '@/lib/supabase/server'

export type StudyData = {
  displayName: string
  initials: string
  decks: DeckSummary[]
  totalCards: number
}

export type StudyResult = {
  data: StudyData
  errorMessage: string | null
}

function getUserIdentity(email: string | undefined, metadata: Record<string, unknown>) {
  const metadataName = [metadata.full_name, metadata.name, metadata.display_name].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )
  const displayName = metadataName?.trim() || email?.split('@')[0] || 'Öğrenci'
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('')

  return { displayName, initials: initials || 'M' }
}

export async function getStudyData(): Promise<StudyResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect('/')

  const cardsResult = await supabase
    .from('cards')
    .select('id, ders, durum, sonraki_tekrar, aralik')

  const cards = (cardsResult.data ?? []) as DeckCardRow[]

  return {
    data: {
      ...getUserIdentity(user.email, user.user_metadata as Record<string, unknown>),
      decks: buildDecks(cards),
      totalCards: cards.length,
    },
    errorMessage: cardsResult.error
      ? 'Deck verileri şu anda yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.'
      : null,
  }
}
