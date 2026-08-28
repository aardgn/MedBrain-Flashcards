function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-3xl bg-[#e6ebe5] ${className}`} />
}

export default function StatsLoading() {
  return (
    <main className="min-h-screen bg-[#f8faf7] px-5 py-8 text-[#111915] lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1460px]">
        <SkeletonBlock className="h-11 w-56" />
        <SkeletonBlock className="mt-4 h-5 w-80 max-w-full" />
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => <SkeletonBlock key={index} className="h-32" />)}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <SkeletonBlock className="h-96" />
          <SkeletonBlock className="h-96" />
        </div>
        <SkeletonBlock className="mt-6 h-80" />
      </div>
    </main>
  )
}
