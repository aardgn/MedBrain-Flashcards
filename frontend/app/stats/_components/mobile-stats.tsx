import { MobileBottomNavigation } from '@/app/_components/app-navigation'
import { DecksIcon, StatsIcon } from '@/app/dashboard/_components/dashboard-icons'
import type { StatsData } from '@/lib/stats'

import { AccuracyTrendChart, StudyActivityChart } from './stats-charts'

type MobileStatsProps = {
  data: StatsData
  errorMessage: string | null
}

function MobileStat({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number | null; suffix?: string }) {
  return (
    <article className="rounded-2xl border border-[#e1e6df] bg-white p-3.5 shadow-[0_5px_18px_rgba(32,64,48,0.05)]">
      <div className="text-[#07563f]">{icon}</div>
      <p className="mt-3 text-xs font-medium text-[#707a75]">{label}</p>
      {value === null ? <p className="mt-1 text-xs font-semibold text-[#8a938e]">Henüz veri yok</p> : <p className="mt-1 text-xl font-bold">{value}{suffix}</p>}
    </article>
  )
}

function MobileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#e1e6df] bg-white p-4 shadow-[0_5px_18px_rgba(32,64,48,0.05)]">
      <div className="flex items-center justify-between"><h2 className="font-bold">{title}</h2><span className="text-xs font-medium text-[#737d78]">7 days</span></div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function MobileStats({ data, errorMessage }: MobileStatsProps) {
  return (
    <div className="min-h-screen bg-[#f8faf7] pb-28 text-[#111915] lg:hidden">
      <main className="mx-auto max-w-xl px-4 pb-8 pt-7">
        <header><h1 className="text-3xl font-bold tracking-tight">Your Progress</h1><p className="mt-2 text-sm text-[#69736e]">Your last seven days at a glance.</p></header>
        {errorMessage ? <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">{errorMessage}</div> : null}

        <div className="mt-6 grid grid-cols-4 rounded-2xl border border-[#e0e4de] bg-white p-1 shadow-sm" aria-label="Zaman aralığı">
          <button type="button" className="h-10 rounded-xl bg-[#07563f] text-sm font-semibold text-white" aria-current="true">7D</button>
          {['30D', '90D', '1Y'].map((range) => <button key={range} type="button" disabled title="Yakında" className="h-10 cursor-not-allowed text-sm font-semibold text-[#a0a7a3]">{range}</button>)}
        </div>

        <section className="mt-4 grid grid-cols-3 gap-2.5" aria-label="Stats özeti">
          <MobileStat icon={<DecksIcon className="size-6" />} label="Cards" value={data.totalReviews} />
          <MobileStat icon={<StatsIcon className="size-6" />} label="Accuracy" value={data.accuracy} suffix="%" />
          <MobileStat icon={<span aria-hidden="true" className="text-2xl">🔥</span>} label="Streak" value={data.streak} />
        </section>

        <div className="mt-4 space-y-4">
          <MobileSection title="Study Activity"><StudyActivityChart data={data.activity} compact /></MobileSection>
          <MobileSection title="Accuracy Trend"><AccuracyTrendChart data={data.activity} compact /></MobileSection>
          <section className="rounded-3xl border border-[#e1e6df] bg-white p-4 shadow-[0_5px_18px_rgba(32,64,48,0.05)]">
            <h2 className="font-bold">Topics Performance</h2>
            {data.deckPerformance.length > 0 ? (
              <div className="mt-5 space-y-5">
                {data.deckPerformance.map((deck) => (
                  <div key={deck.name}>
                    <div className="flex items-center justify-between gap-3 text-sm"><p className="truncate font-semibold" title={deck.name}>{deck.name}</p><span className="font-bold">{deck.accuracy}%</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7e9e2]"><div className="h-full rounded-full bg-[#17684f]" style={{ width: `${deck.accuracy}%` }} /></div>
                    <p className="mt-1 text-xs text-[#818a85]">{deck.reviewCount} reviews</p>
                  </div>
                ))}
              </div>
            ) : <div className="mt-4 flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-[#d6ded5] bg-[#fafbf8] text-sm font-medium text-[#78827d]">Henüz veri yok</div>}
          </section>
        </div>
      </main>
      <MobileBottomNavigation active="stats" />
    </div>
  )
}
