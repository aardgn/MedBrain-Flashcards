import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginScreen } from '@/app/_components/login-screen'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sign in | Medonie',
  description: 'Sign in to Medonie and continue studying smarter.',
}

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return <LoginScreen />
}
