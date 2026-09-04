import { redirect } from 'next/navigation'

import { resetExpiredStreak, STREAK_TIME_ZONE } from '@/lib/streak'
import { createClient } from '@/lib/supabase/server'

const DAY_IN_MILLISECONDS = 86_400_000

type ReviewLogRow = {
  card_id: number | string
  sonuc: string
  created_at: string
}

type StatsCardRow = {
  id: number | string
  ders: string | null
}

type StreakRow = {
  streak: number | string | null
}

export type DailyStats = {
  dateKey: string
  shortLabel: string
  count: number
  accuracy: number | null
}

export type DeckPerformance = {
  name: string
  reviewCount: number
  accuracy: number
}

export type StatsData = {
  displayName: string
  initials: string
  streak: number | null
  totalReviews: number | null
  accuracy: number | null
  activity: DailyStats[]
  deckPerformance: DeckPerformance[]
}

export type StatsResult = {
  data: StatsData
  errorMessage: string | null
}

function numberValue(value: number | string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: STREAK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''

  return `${part('year')}-${part('month')}-${part('day')}`
}

function getShortDayLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: STREAK_TIME_ZONE,
    weekday: 'short',
  }).format(date)
}

function getLastSevenDays(now: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getTime() - (6 - index) * DAY_IN_MILLISECONDS)
    return { dateKey: getDateKey(date), shortLabel: getShortDayLabel(date) }
  })
}

function isCorrectResult(result: string) {
  return result === 'Kolaydı' || result === 'Zordu'
}

function calculateAccuracy(logs: ReviewLogRow[]) {
  if (logs.length === 0) return null
  const correctCount = logs.filter((log) => isCorrectResult(log.sonuc)).length
  return Math.round((correctCount / logs.length) * 100)
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

export async function getStatsData(): Promise<StatsResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect('/')

  const now = new Date()
  const streakResetError = await resetExpiredStreak(supabase, now)
  const lastSevenDays = getLastSevenDays(now)
  const includedDateKeys = new Set(lastSevenDays.map((day) => day.dateKey))

  // Fetch a slightly wider UTC window, then apply the exact Istanbul calendar-day
  // boundary in memory. This avoids inventing partial-day values around midnight.
  const queryStart = new Date(now.getTime() - 8 * DAY_IN_MILLISECONDS).toISOString()
  const [logsResult, cardsResult, streakResult] = await Promise.all([
    supabase
      .from('review_logs')
      .select('card_id, sonuc, created_at')
      .gte('created_at', queryStart)
      .order('created_at', { ascending: true }),
    supabase.from('cards').select('id, ders'),
    supabase.from('stats').select('streak'),
  ])

  const logs = ((logsResult.data ?? []) as ReviewLogRow[]).filter((log) => {
    const date = new Date(log.created_at)
    return !Number.isNaN(date.getTime()) && includedDateKeys.has(getDateKey(date))
  })
  const cards = (cardsResult.data ?? []) as StatsCardRow[]
  const streak = (streakResult.data?.[0] ?? null) as StreakRow | null

  const logsByDay = new Map<string, ReviewLogRow[]>()
  for (const log of logs) {
    const dateKey = getDateKey(new Date(log.created_at))
    const dayLogs = logsByDay.get(dateKey) ?? []
    dayLogs.push(log)
    logsByDay.set(dateKey, dayLogs)
  }

  const activity = lastSevenDays.map((day) => {
    const dayLogs = logsByDay.get(day.dateKey) ?? []
    return {
      ...day,
      count: dayLogs.length,
      accuracy: calculateAccuracy(dayLogs),
    }
  })

  const cardDecks = new Map(
    cards.map((card) => [String(card.id), card.ders?.trim() || 'Genel']),
  )
  const logsByDeck = new Map<string, ReviewLogRow[]>()
  for (const log of logs) {
    const deckName = cardDecks.get(String(log.card_id))
    if (!deckName) continue
    const deckLogs = logsByDeck.get(deckName) ?? []
    deckLogs.push(log)
    logsByDeck.set(deckName, deckLogs)
  }

  const deckPerformance = Array.from(logsByDeck, ([name, deckLogs]) => ({
    name,
    reviewCount: deckLogs.length,
    accuracy: calculateAccuracy(deckLogs) ?? 0,
  })).sort(
    (left, right) =>
      right.reviewCount - left.reviewCount || left.name.localeCompare(right.name, 'tr'),
  )

  const queryErrors = [
    streakResetError,
    logsResult.error,
    cardsResult.error,
    streakResult.error,
  ].filter(Boolean)

  return {
    data: {
      ...getUserIdentity(user.email, user.user_metadata as Record<string, unknown>),
      streak:
        streakResult.error || !streak
          ? null
          : Math.max(0, numberValue(streak.streak)),
      totalReviews: logsResult.error || logs.length === 0 ? null : logs.length,
      accuracy: logsResult.error ? null : calculateAccuracy(logs),
      activity: logsResult.error ? [] : activity,
      deckPerformance: logsResult.error || cardsResult.error ? [] : deckPerformance,
    },
    errorMessage:
      queryErrors.length > 0
        ? 'Stats verilerinin bir bölümü şu anda yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.'
        : null,
  }
}
