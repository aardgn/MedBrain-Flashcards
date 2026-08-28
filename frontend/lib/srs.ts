export const SECONDS_PER_DAY = 86_400

export const REVIEW_RESULTS = ['Bilemedim', 'Zordu', 'Kolaydı'] as const

export type ReviewResult = (typeof REVIEW_RESULTS)[number]

export type NextReview = {
  interval: number
  nextReviewAt: number
}

/**
 * TypeScript port of services/srs.py::calculate_next_review.
 * Times are Unix seconds, matching the existing cards.sonraki_tekrar values.
 */
export function calculateNextReview(
  currentInterval: number,
  result: ReviewResult,
  nowInSeconds = Date.now() / 1000,
): NextReview {
  if (result === 'Bilemedim') {
    return { interval: 0, nextReviewAt: nowInSeconds }
  }

  if (result === 'Zordu') {
    const interval = Math.max(1, currentInterval)
    return {
      interval,
      nextReviewAt: nowInSeconds + interval * SECONDS_PER_DAY,
    }
  }

  if (result === 'Kolaydı') {
    const interval = currentInterval === 0 ? currentInterval + 3 : currentInterval * 2
    return {
      interval,
      nextReviewAt: nowInSeconds + interval * SECONDS_PER_DAY,
    }
  }

  throw new Error(`Bilinmeyen review sonucu: ${String(result)}`)
}
