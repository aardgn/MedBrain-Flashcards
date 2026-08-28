import type { Metadata } from 'next'

import { getDashboardData } from '@/lib/dashboard'

import { DesktopDashboard } from './_components/desktop-dashboard'
import { MobileDashboard } from './_components/mobile-dashboard'

export const metadata: Metadata = {
  title: 'Dashboard | Medonie',
  description: 'Çalışma decklerin ve öğrenme serin için Medonie dashboard.',
}

export default async function DashboardPage() {
  const dashboard = await getDashboardData()

  return (
    <>
      <MobileDashboard data={dashboard.data} errorMessage={dashboard.errorMessage} />
      <DesktopDashboard data={dashboard.data} errorMessage={dashboard.errorMessage} />
    </>
  )
}
