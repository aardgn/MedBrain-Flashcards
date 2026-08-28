const SECONDS_PER_DAY = 86_400

export type DeckCardRow = {
  id: number | string
  ders: string | null
  durum: string | null
  sonraki_tekrar: number | string | null
  aralik: number | string | null
}

export type DeckSummary = {
  name: string
  cardCount: number
  progress: number
  lastStudiedAt: number
}

function numberValue(value: number | string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function wasStudied(card: DeckCardRow) {
  const status = card.durum?.trim().toLocaleLowerCase('tr-TR') ?? ''
  return numberValue(card.aralik) > 0 || (status !== '' && status !== 'yeni' && status !== 'new')
}

function getLastStudiedAt(card: DeckCardRow) {
  if (!wasStudied(card)) return 0

  let nextReview = numberValue(card.sonraki_tekrar)
  if (nextReview <= 0) return 0

  // The current SRS implementation stores Unix seconds; tolerate milliseconds too.
  if (nextReview > 10_000_000_000) nextReview /= 1000

  const interval = numberValue(card.aralik)
  return interval > 0 ? nextReview - interval * SECONDS_PER_DAY : nextReview
}

export function buildDecks(cards: DeckCardRow[]): DeckSummary[] {
  const grouped = new Map<string, DeckCardRow[]>()

  for (const card of cards) {
    const deckName = card.ders?.trim() || 'Genel'
    const deckCards = grouped.get(deckName) ?? []
    deckCards.push(card)
    grouped.set(deckName, deckCards)
  }

  return Array.from(grouped, ([name, deckCards]) => {
    const studiedCount = deckCards.filter(wasStudied).length

    return {
      name,
      cardCount: deckCards.length,
      progress: Math.round((studiedCount / deckCards.length) * 100),
      lastStudiedAt: Math.max(0, ...deckCards.map(getLastStudiedAt)),
    }
  }).sort(
    (left, right) =>
      right.lastStudiedAt - left.lastStudiedAt || left.name.localeCompare(right.name, 'tr'),
  )
}
