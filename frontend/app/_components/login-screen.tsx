'use client'

import { createClient } from '@/lib/supabase/client'

import { DecksIcon, LogoIcon, StatsIcon, TutorIcon } from '@/app/dashboard/_components/dashboard-icons'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.4a4.6 4.6 0 0 1-2 3v2.7h3.5c2-1.9 3.2-4.6 3.2-7.7Z" />
      <path fill="#34A853" d="M12 22c2.9 0 5.3-1 7-2.6l-3.5-2.7a6.4 6.4 0 0 1-9.5-3.4H2.5V16A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6 13.3a6 6 0 0 1 0-3.8V6.8H2.5a10 10 0 0 0 0 9.2L6 13.3Z" />
      <path fill="#EA4335" d="M12 5.6c1.6 0 3.1.6 4.3 1.7l3.1-3.1A10 10 0 0 0 2.5 6.8L6 9.5A6 6 0 0 1 12 5.6Z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.1 12.6c0-2.6 2.1-3.8 2.2-3.9a4.7 4.7 0 0 0-3.7-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-1-3.3-.9a4.9 4.9 0 0 0-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5a11 11 0 0 0 1.4-2.9c-.1 0-2.9-1.1-2.9-4Zm-2.5-7.5A4.6 4.6 0 0 0 15.7 2a4.7 4.7 0 0 0-3 1.5 4.3 4.3 0 0 0-1.1 3c1.1.1 2.3-.5 3-1.4Z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e5ebdf] text-[#176044]">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-[#1c2923]">{title}</h3>
        <p className="mt-1 max-w-72 text-sm leading-6 text-[#62706a]">{description}</p>
      </div>
    </li>
  )
}

export function LoginScreen() {
  async function signInWithGoogle() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    })

    if (error) {
      alert(error.message)
      return
    }

    if (data.url) {
      window.location.assign(data.url)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5eb] text-[#18221e] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(500px,0.92fr)]">
      <section className="relative hidden min-h-screen overflow-hidden border-r border-[#e9e6da] px-10 py-9 lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div className="relative z-10 flex items-center gap-3 text-[#07563f]">
          <LogoIcon className="size-12" />
          <span className="font-serif text-4xl font-bold tracking-tight">Medonie</span>
        </div>

        <div className="relative z-10 mt-14 max-w-xl pb-12 xl:mt-20 xl:pb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#edf1e7] px-4 py-2 text-sm font-semibold text-[#28654f]">
            <span className="flex size-5 items-center justify-center rounded-full border border-[#6f9786]">✓</span>
            AI-powered flashcards for medical students
          </div>
          <h1 className="mt-7 max-w-lg font-serif text-5xl font-bold leading-[1.08] tracking-tight text-[#18221e] xl:text-6xl">
            Study smarter.<br />Remember longer.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#5f6d67]">
            Create flashcards from your materials, study with spaced repetition, and get AI-powered help whenever you need it.
          </p>

          <ul className="mt-9 space-y-6">
            <Feature title="AI Flashcards" description="Generate high-quality cards from your notes and PDFs." icon={<DecksIcon className="size-7" />} />
            <Feature title="Track Progress" description="Monitor your learning and improve every day." icon={<StatsIcon className="size-7" />} />
            <Feature title="AI Tutor" description="Ask questions and get answers from your sources." icon={<TutorIcon className="size-7" />} />
          </ul>
        </div>

      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-10 xl:px-16">
        <div className="w-full max-w-[560px]">
          <div className="mb-9 flex items-center justify-center gap-2 text-[#07563f] lg:hidden">
            <LogoIcon className="size-11" />
            <span className="font-serif text-4xl font-bold tracking-tight">Medonie</span>
          </div>

          <div className="rounded-[2rem] border border-[#ebeae4] bg-white px-5 py-8 shadow-[0_20px_60px_rgba(33,56,45,0.10)] sm:px-10 sm:py-10 xl:px-12 xl:py-12">
            <div className="text-center">
              <h2 className="font-serif text-4xl font-bold tracking-tight text-[#17211d] sm:text-5xl">Welcome back</h2>
              <p className="mt-3 text-[#6d7772]">Sign in to continue to Medonie</p>
            </div>

            <div className="mt-9 space-y-3">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex h-14 w-full items-center justify-center gap-4 rounded-xl border border-[#dfe2dc] bg-white px-5 font-semibold shadow-sm transition hover:border-[#aebdb3] hover:bg-[#fbfcfa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07563f]"
              >
                <GoogleIcon /> Continue with Google
              </button>
              <button
                type="button"
                disabled
                title="Yakında"
                className="relative flex h-14 w-full cursor-not-allowed items-center justify-center gap-4 rounded-xl border border-[#e5e6e2] bg-[#fafaf8] px-5 font-semibold text-[#8a918d] opacity-65"
              >
                <AppleIcon /> Continue with Apple
                <span className="absolute right-3 rounded-full bg-[#eceeea] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">Yakında</span>
              </button>
            </div>

            <div className="my-7 flex items-center gap-4 text-sm text-[#8a918d]">
              <div className="h-px flex-1 bg-[#e4e5e0]" />
              <span>or</span>
              <div className="h-px flex-1 bg-[#e4e5e0]" />
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Email</span>
                <input
                  type="email"
                  disabled
                  autoComplete="email"
                  placeholder="you@example.com"
                  title="Yakında"
                  className="h-14 w-full cursor-not-allowed rounded-xl border border-[#e1e3de] bg-[#f7f7f4] px-4 text-[#8a918d] outline-none placeholder:text-[#a6aca8]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Password</span>
                <span className="relative block">
                  <input
                    type="password"
                    disabled
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    title="Yakında"
                    className="h-14 w-full cursor-not-allowed rounded-xl border border-[#e1e3de] bg-[#f7f7f4] px-4 pr-12 text-[#8a918d] outline-none placeholder:text-[#a6aca8]"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#969d99]">
                    <EyeIcon />
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 text-sm">
              <label className="flex cursor-not-allowed items-center gap-2 text-[#929995]">
                <input type="checkbox" disabled className="size-4 accent-[#07563f]" />
                Remember me
              </label>
              <button type="button" disabled title="Yakında" className="cursor-not-allowed font-medium text-[#94a19a]">
                Forgot password?
              </button>
            </div>

            <button
              type="button"
              disabled
              title="Yakında"
              className="mt-7 flex h-14 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl bg-[#7b9b8e] px-5 font-semibold text-white opacity-60"
            >
              Continue with Email
              <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">Yakında</span>
            </button>

            <p className="mt-7 text-center text-sm text-[#69736e]">
              Don&apos;t have an account?{' '}
              <button type="button" disabled title="Yakında" className="cursor-not-allowed font-semibold text-[#8da298]">
                Sign up
              </button>
            </p>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[#79837e]">
            <span aria-hidden="true">🔒</span> Your data is secure and private.
          </p>
        </div>
      </section>
    </main>
  )
}
