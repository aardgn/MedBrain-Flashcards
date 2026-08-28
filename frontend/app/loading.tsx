export default function Loading() {
  return (
    <main className="min-h-screen bg-[#fbfcfa] p-5 lg:p-10" aria-label="Dashboard yükleniyor">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="h-11 w-44 rounded-xl bg-[#e8ece6]" />
        <div className="mt-14 h-9 w-72 max-w-full rounded-xl bg-[#e8ece6]" />
        <div className="mt-4 h-5 w-96 max-w-full rounded-lg bg-[#eff1ed]" />
        <div className="mt-12 h-28 rounded-3xl bg-[#e8ece6]" />
        <div className="mt-7 grid gap-7 lg:grid-cols-3">
          <div className="h-80 rounded-3xl bg-[#eff1ed] lg:col-span-2" />
          <div className="h-80 rounded-3xl bg-[#eff1ed]" />
        </div>
      </div>
    </main>
  )
}
