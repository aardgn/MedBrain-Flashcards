export default function CreateDeckLoading() {
  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="h-5 w-28 rounded bg-[#e3e9e2]" />
        <div className="mt-8 h-10 w-72 max-w-full rounded bg-[#e3e9e2]" />
        <div className="mt-4 h-5 w-full max-w-xl rounded bg-[#e3e9e2]" />
        <div className="mt-8 rounded-[2rem] border border-[#dfe5de] bg-white p-8">
          <div className="h-12 rounded-xl bg-[#edf1ec]" />
          <div className="mt-6 h-52 rounded-2xl bg-[#edf1ec]" />
          <div className="mt-6 h-13 rounded-xl bg-[#dce6df]" />
        </div>
      </div>
    </main>
  )
}
