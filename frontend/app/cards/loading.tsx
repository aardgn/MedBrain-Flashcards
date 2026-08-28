function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#e8ece6] ${className}`} />
}

export default function CardsLoading() {
  return (
    <main className="min-h-screen bg-[#f8faf7] px-5 py-8 lg:ml-72 lg:px-12 lg:py-10" aria-label="Deckler yükleniyor">
      <div className="mx-auto max-w-[1460px]">
        <SkeletonBlock className="h-11 w-48" />
        <SkeletonBlock className="mt-4 h-5 w-80 max-w-full" />
        <SkeletonBlock className="mt-8 h-12 w-full lg:mt-10" />
        <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonBlock key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    </main>
  )
}
