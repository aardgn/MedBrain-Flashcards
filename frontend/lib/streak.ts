import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

export const STREAK_TIME_ZONE = 'Europe/Istanbul'

export function getStreakDateKey(date: Date) {
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

export function getExpiredStreakCutoffDate(now: Date) {
  const [year, month, day] = getStreakDateKey(now).split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10)
}

export async function resetExpiredStreak(
  supabase: SupabaseClient,
  now = new Date(),
): Promise<PostgrestError | null> {
  const yesterday = getExpiredStreakCutoffDate(now)
  const { error } = await supabase
    .from('stats')
    .update({ streak: 0 })
    .lt('son_calisma', yesterday)

  return error
}
