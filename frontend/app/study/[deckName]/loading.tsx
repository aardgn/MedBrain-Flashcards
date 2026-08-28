export default function ReviewLoading() {
  return (
    <main className="min-h-screen bg-[#f8faf7] px-5 py-8 text-[#111915] sm:px-8 lg:py-10">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-[#e2e9e2]" />
            <div className="h-7 w-44 rounded bg-[#e2e9e2]" />
          </div>
          <div className="h-10 w-20 rounded-full bg-[#e2e9e2]" />
        </div>
        <div className="mx-auto mt-16 h-[clamp(500px,65vh,620px)] max-w-2xl rounded-[2rem] bg-white shadow-[0_20px_60px_rgba(32,64,48,0.08)]" />
      </div>
    </main>
  )
}
