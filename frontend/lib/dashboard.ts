import { redirect } from 'next/navigation'

import { buildDecks, type DeckCardRow, type DeckSummary } from '@/lib/decks'
import { createClient } from '@/lib/supabase/server'

type DashboardStatsRow = {
  streak: number | null
  son_calisma: string | null
}

export type DashboardDeck = DeckSummary

export type DashboardData = {
  displayName: string
  firstName: string
  initials: string
  streak: number
  decks: DashboardDeck[]
}

export type DashboardResult = {
  data: DashboardData
  errorMessage: string | null
}

function numberValue(value: number | string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getUserNames(email: string | undefined, metadata: Record<string, unknown>) {
  const metadataName = [metadata.full_name, metadata.name, metadata.display_name].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )
  const displayName = metadataName?.trim() || email?.split('@')[0] || 'Öğrenci'
  const firstName = displayName.split(/\s+/)[0]
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('')

  return { displayName, firstName, initials: initials || 'M' }
}

export async function getDashboardData(): Promise<DashboardResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect('/')

  const [cardsResult, statsResult] = await Promise.all([
    supabase.from('cards').select('id, ders, durum, sonraki_tekrar, aralik'),
    supabase.from('stats').select('streak, son_calisma'),
  ])

  const names = getUserNames(user.email, user.user_metadata as Record<string, unknown>)
  const cards = (cardsResult.data ?? []) as DeckCardRow[]
  const stats = (statsResult.data?.[0] ?? null) as DashboardStatsRow | null
  const queryErrors = [cardsResult.error, statsResult.error].filter(Boolean)

  return {
    data: {
      ...names,
      streak: Math.max(0, numberValue(stats?.streak ?? 0)),
      decks: buildDecks(cards),
    },
    errorMessage:
      queryErrors.length > 0
        ? 'Dashboard verilerinin bir bölümü şu anda yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.'
        : null,
  }
}
