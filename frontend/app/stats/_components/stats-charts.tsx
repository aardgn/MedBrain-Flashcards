import type { DailyStats } from '@/lib/stats'

type ChartProps = {
  data: DailyStats[]
  compact?: boolean
}

function EmptyChart() {
  return (
    <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-[#d6ded5] bg-[#fafbf8] px-6 text-center text-sm font-medium text-[#78827d]">
      Henüz veri yok
    </div>
  )
}

export function StudyActivityChart({ data, compact = false }: ChartProps) {
  const hasData = data.some((day) => day.count > 0)
  if (!hasData) return <EmptyChart />

  const width = 700
  const height = compact ? 250 : 280
  const chartTop = 22
  const chartBottom = height - 42
  const chartHeight = chartBottom - chartTop
  const maxCount = Math.max(...data.map((day) => day.count))
  const columnWidth = width / data.length
  const barWidth = Math.min(46, columnWidth * 0.48)

  return (
    <svg role="img" aria-label="Son yedi günün review sayıları" viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible">
      {[0, 0.5, 1].map((ratio) => {
        const y = chartBottom - ratio * chartHeight
        return <line key={ratio} x1="28" x2={width - 12} y1={y} y2={y} stroke="#e4e8e1" strokeWidth="1" />
      })}
      {data.map((day, index) => {
        const x = index * columnWidth + columnWidth / 2
        const barHeight = (day.count / maxCount) * chartHeight
        return (
          <g key={day.dateKey}>
            <rect x={x - barWidth / 2} y={chartBottom - barHeight} width={barWidth} height={barHeight} rx="7" fill="#17684f" />
            <text x={x} y={Math.max(chartTop + 10, chartBottom - barHeight - 9)} textAnchor="middle" className="fill-[#415049] text-[13px] font-semibold">{day.count}</text>
            <text x={x} y={height - 13} textAnchor="middle" className="fill-[#707a75] text-[13px]">{day.shortLabel}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function AccuracyTrendChart({ data, compact = false }: ChartProps) {
  const points = data
    .map((day, index) => ({ day, index }))
    .filter((item) => item.day.accuracy !== null)
  if (points.length === 0) return <EmptyChart />

  const width = 700
  const height = compact ? 250 : 280
  const chartTop = 20
  const chartBottom = height - 44
  const chartHeight = chartBottom - chartTop
  const chartLeft = 35
  const chartRight = width - 18
  const xForIndex = (index: number) => chartLeft + (index / Math.max(1, data.length - 1)) * (chartRight - chartLeft)
  const yForAccuracy = (accuracy: number) => chartBottom - (accuracy / 100) * chartHeight
  const segments: typeof points[] = []
  let currentSegment: typeof points = []
  data.forEach((day, index) => {
    if (day.accuracy === null) {
      if (currentSegment.length > 0) segments.push(currentSegment)
      currentSegment = []
      return
    }
    currentSegment.push({ day, index })
  })
  if (currentSegment.length > 0) segments.push(currentSegment)

  return (
    <svg role="img" aria-label="Son yedi günün günlük accuracy yüzdesi" viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible">
      {[0, 50, 100].map((value) => {
        const y = yForAccuracy(value)
        return (
          <g key={value}>
            <line x1={chartLeft} x2={chartRight} y1={y} y2={y} stroke="#e4e8e1" strokeWidth="1" />
            <text x="27" y={y + 4} textAnchor="end" className="fill-[#7a847f] text-[12px]">{value}%</text>
          </g>
        )
      })}
      {segments.map((segment) => {
        if (segment.length < 2) return null
        const path = segment
          .map(({ day, index }, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${xForIndex(index)} ${yForAccuracy(day.accuracy!)}`)
          .join(' ')
        return <path key={segment[0].day.dateKey} d={path} fill="none" stroke="#17684f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      })}
      {points.map(({ day, index }) => (
        <g key={day.dateKey}>
          <circle cx={xForIndex(index)} cy={yForAccuracy(day.accuracy!)} r="5" fill="#17684f" />
          <text x={xForIndex(index)} y={yForAccuracy(day.accuracy!) - 11} textAnchor="middle" className="fill-[#415049] text-[12px] font-semibold">{day.accuracy}%</text>
        </g>
      ))}
      {data.map((day, index) => (
        <text key={day.dateKey} x={xForIndex(index)} y={height - 13} textAnchor="middle" className="fill-[#707a75] text-[13px]">{day.shortLabel}</text>
      ))}
    </svg>
  )
}
