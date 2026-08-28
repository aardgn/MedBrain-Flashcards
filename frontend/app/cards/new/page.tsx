import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DesktopSidebar, MobileBottomNavigation } from '@/app/_components/app-navigation'
import { createClient } from '@/lib/supabase/server'

import { CreateDeckForm } from './_components/create-deck-form'

export const metadata: Metadata = {
  title: 'Create Deck | Medonie',
  description: 'Ders materyalinden yapay zekâ destekli flashcard oluştur.',
}

function getIdentity(email: string | undefined, metadata: Record<string, unknown>) {
  const metadataName = [metadata.full_name, metadata.name, metadata.display_name].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )
  const displayName = metadataName?.trim() || email?.split('@')[0] || 'Öğrenci'
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('') || 'M'
  return { displayName, initials }
}

export default async function CreateDeckPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect('/')

  const decksResult = await supabase.from('cards').select('ders')
  const existingDecks = Array.from(
    new Set(
      (decksResult.data ?? [])
        .map((row) => typeof row.ders === 'string' ? row.ders.trim() : '')
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right, 'tr'))
  const identity = getIdentity(user.email, user.user_metadata as Record<string, unknown>)

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#111915] lg:flex">
      <div className="hidden lg:flex"><DesktopSidebar active="study" user={identity} /></div>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-8 lg:px-12 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/cards" className="inline-flex rounded-lg py-2 text-sm font-semibold text-[#527064] transition hover:text-[#07563f]">← Back to decks</Link>
          <header className="mt-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#56806c]">AI Flashcards</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Create New Deck</h1>
            <p className="mt-3 max-w-2xl text-[#68736e]">PDF veya ders notu görselinizi yükleyin; Medonie önemli bilgileri TUS tarzı flashcard&apos;lara dönüştürsün.</p>
          </header>
          {decksResult.error ? <div role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">Mevcut deck önerileri yüklenemedi; yine de yeni bir deck oluşturabilirsiniz.</div> : null}
          <div className="mt-7"><CreateDeckForm existingDecks={existingDecks} /></div>
        </div>
      </main>
      <div className="lg:hidden"><MobileBottomNavigation active="study" /></div>
    </div>
  )
}
