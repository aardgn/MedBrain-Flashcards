import { DesktopSidebar } from '@/app/_components/app-navigation'
import { DecksIcon, StatsIcon } from '@/app/dashboard/_components/dashboard-icons'
import type { StatsData } from '@/lib/stats'

import { AccuracyTrendChart, StudyActivityChart } from './stats-charts'

type DesktopStatsProps = {
  data: StatsData
  errorMessage: string | null
}

function FlameIcon({ active }: { active: boolean }) {
  return <span aria-hidden="true" className={`text-3xl ${active ? '' : 'grayscale opacity-50'}`}>🔥</span>
}

function RangeSelector() {
  return (
    <div className="flex rounded-xl border border-[#dfe4dd] bg-white p-1 shadow-sm" aria-label="Zaman aralığı">
      <button type="button" className="h-10 rounded-lg bg-[#07563f] px-5 text-sm font-semibold text-white" aria-current="true">7D</button>
      {['30D', '90D', '1Y'].map((range) => (
        <button key={range} type="button" disabled title="Yakında" className="h-10 cursor-not-allowed px-5 text-sm font-semibold text-[#a0a7a3]">{range}</button>
      ))}
    </div>
  )
}

function StatCard({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number | null; suffix?: string }) {
  return (
    <article className="flex items-center gap-5 rounded-3xl border border-[#e0e5de] bg-white p-5 shadow-[0_8px_28px_rgba(32,64,48,0.05)]">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#edf2e9] text-[#07563f]">{icon}</div>
      <div>
        <p className="text-sm font-medium text-[#6e7873]">{label}</p>
        {value === null ? (
          <p className="mt-1 text-sm font-semibold text-[#8a938e]">Henüz veri yok</p>
        ) : (
          <p className="mt-1 text-3xl font-bold">{value}{suffix}</p>
        )}
      </div>
    </article>
  )
}

function DeckPerformancePanel({ data }: { data: StatsData['deckPerformance'] }) {
  return (
    <section className="rounded-3xl border border-[#e0e5de] bg-white p-6 shadow-[0_8px_28px_rgba(32,64,48,0.05)]">
      <div>
        <h2 className="text-xl font-bold">Deck Performance</h2>
        <p className="mt-1 text-sm text-[#727c77]">Accuracy by deck</p>
      </div>
      {data.length > 0 ? (
        <div className="mt-7 space-y-6">
          {data.map((deck, index) => (
            <div key={deck.name} className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e8f0ea] text-xl" aria-hidden="true">{['🫀', '🧠', '🧬', '🫁', '🩺'][index % 5]}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="truncate font-semibold" title={deck.name}>{deck.name}</p>
                  <span className="text-sm font-bold text-[#31443b]">{deck.accuracy}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e7e9e2]"><div className="h-full rounded-full bg-[#17684f]" style={{ width: `${deck.accuracy}%` }} /></div>
                <p className="mt-1.5 text-xs text-[#818a85]">{deck.reviewCount} reviews</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7 flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#d6ded5] bg-[#fafbf8] text-sm font-medium text-[#78827d]">Henüz veri yok</div>
      )}
    </section>
  )
}

export function DesktopStats({ data, errorMessage }: DesktopStatsProps) {
  return (
    <div className="hidden min-h-screen bg-[#f8faf7] text-[#111915] lg:flex">
      <DesktopSidebar active="stats" user={{ displayName: data.displayName, initials: data.initials }} />
      <main className="min-w-0 flex-1 px-8 py-10 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-[1460px]">
          {errorMessage ? <div role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">{errorMessage}</div> : null}
          <header className="flex items-start justify-between gap-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">Your Stats</h1>
              <p className="mt-3 text-lg text-[#68736e]">Track your progress and keep improving every day.</p>
            </div>
            <RangeSelector />
          </header>

          <section className="mt-8 grid grid-cols-3 gap-5" aria-label="Stats özeti">
            <StatCard icon={<DecksIcon className="size-7" />} label="Cards Studied" value={data.totalReviews} />
            <StatCard icon={<StatsIcon className="size-7" />} label="Accuracy" value={data.accuracy} suffix="%" />
            <StatCard icon={<FlameIcon active={(data.streak ?? 0) > 0} />} label="Current Streak" value={data.streak} suffix=" days" />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.85fr)]">
            <section className="rounded-3xl border border-[#e0e5de] bg-white p-6 shadow-[0_8px_28px_rgba(32,64,48,0.05)]">
              <div className="flex items-center justify-between gap-5"><div><h2 className="text-xl font-bold">Study Activity</h2><p className="mt-1 text-sm text-[#727c77]">Reviews per day</p></div><span className="text-sm font-medium text-[#717c76]">7 days</span></div>
              <div className="mt-5"><StudyActivityChart data={data.activity} /></div>
            </section>
            <DeckPerformancePanel data={data.deckPerformance} />
          </div>

          <section className="mt-6 rounded-3xl border border-[#e0e5de] bg-white p-6 shadow-[0_8px_28px_rgba(32,64,48,0.05)]">
            <div className="flex items-center justify-between gap-5"><div><h2 className="text-xl font-bold">Accuracy Trend</h2><p className="mt-1 text-sm text-[#727c77]">Daily remembered-card accuracy</p></div><span className="text-sm font-medium text-[#717c76]">7 days</span></div>
            <div className="mt-5"><AccuracyTrendChart data={data.activity} /></div>
          </section>
        </div>
      </main>
    </div>
  )
}
