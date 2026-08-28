import type { Metadata } from 'next'

import { getStudyData } from '@/lib/study'

import { DesktopStudy } from './_components/desktop-study'
import { MobileStudy } from './_components/mobile-study'

export const metadata: Metadata = {
  title: 'Study | Medonie',
  description: 'Medonie decklerini görüntüle ve çalışmaya devam et.',
}

export default async function CardsPage() {
  const study = await getStudyData()

  return (
    <>
      <MobileStudy data={study.data} errorMessage={study.errorMessage} />
      <DesktopStudy data={study.data} errorMessage={study.errorMessage} />
    </>
  )
}
