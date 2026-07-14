import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            LifeOS
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/calendar" className="transition hover:text-foreground">
              Calendar
            </Link>
            <Link href="/diary" className="transition hover:text-foreground">
              Diary
            </Link>
            <Link href="/todos" className="transition hover:text-foreground">
              To-Do
            </Link>
            <Link href="/capture" className="transition hover:text-foreground">
              Check-in
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="hidden sm:inline">{user.email}</span>
          <form action={signOut}>
            <button className="rounded-lg border border-border px-3 py-1.5 transition hover:border-accent hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  )
}
