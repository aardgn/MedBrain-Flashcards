import type { Metadata } from 'next'

import { getReviewData } from '@/lib/review'

import { ReviewSession } from './_components/review-session'

export const metadata: Metadata = {
  title: 'Review | Medonie',
  description: 'Due flashcardlarını Medonie ile tekrar et.',
}

function decodeDeckName(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ deckName: string }>
}) {
  const { deckName: encodedDeckName } = await params
  const deckName = decodeDeckName(encodedDeckName)
  const review = await getReviewData(deckName)

  return <ReviewSession initialData={review.data} initialError={review.errorMessage} />
}
