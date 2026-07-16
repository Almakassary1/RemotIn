import type { Metadata } from 'next'
import { login } from './actions'

export const metadata: Metadata = {
  title: 'Masuk Admin — RemotIn',
  robots: { index: false, follow: false },
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8"
      >
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          Admin RemotIn
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-muted)]">Masuk untuk mengelola loker.</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Password salah. Coba lagi.
          </p>
        )}

        <label className="mt-6 block text-sm font-medium text-[var(--color-ink)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1.5 w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347]"
        >
          Masuk
        </button>
      </form>
    </main>
  )
}