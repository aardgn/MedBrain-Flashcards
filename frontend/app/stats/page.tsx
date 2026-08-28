import type { Metadata } from 'next'

import { getStatsData } from '@/lib/stats'

import { DesktopStats } from './_components/desktop-stats'
import { MobileStats } from './_components/mobile-stats'

export const metadata: Metadata = {
  title: 'Stats | Medonie',
  description: 'Son yedi gündeki çalışma aktiviteni ve başarı trendini görüntüle.',
}

export default async function StatsPage() {
  const stats = await getStatsData()

  return (
    <>
      <MobileStats data={stats.data} errorMessage={stats.errorMessage} />
      <DesktopStats data={stats.data} errorMessage={stats.errorMessage} />
    </>
  )
}
