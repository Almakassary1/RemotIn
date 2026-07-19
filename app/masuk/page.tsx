'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signInWithPassword, signInWithGoogle } from './actions'
import Toast from '@/components/Toast'

const inputClass =
  'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15'
const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-ink)]'

const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  auth: 'Link ini sudah tidak valid atau kedaluwarsa. Coba kirim ulang dari awal.',
  google: 'Gagal memulai login Google. Silakan coba lagi.',
}

// useSearchParams() wajib dibungkus <Suspense> (aturan Next.js App Router),
// makanya logika utamanya dipindah ke komponen terpisah di bawah.
export default function MasukPage() {
  return (
    <Suspense fallback={null}>
      <MasukForm />
    </Suspense>
  )
}

function MasukForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Tangkap ?error=... dari redirect /auth/callback yang gagal (link
  // kedaluwarsa, kode tidak valid, dst) — tanpa ini orang cuma didaratkan
  // balik ke sini tanpa tahu kenapa.
  useEffect(() => {
    const errorCode = searchParams.get('error')
    if (errorCode) {
      setToast({
        type: 'error',
        message: CALLBACK_ERROR_MESSAGES[errorCode] ?? 'Terjadi kesalahan. Silakan coba lagi.',
      })
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const result = await signInWithPassword(formData)

    if (!result.success) {
      setToast({ type: 'error', message: result.error ?? 'Gagal masuk. Silakan coba lagi.' })
      setLoading(false)
      return
    }

    // Full navigation (bukan router.push) sengaja dipakai supaya layout
    // server (Navbar) dan AuthSync ikut mount ulang dengan sesi terbaru.
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-sm px-6 py-14 sm:py-20">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
            Masuk ke RemotIn
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Loker tersimpan kamu ikut nyambung di device manapun.
          </p>
        </div>

        <form action={signInWithGoogle} className="mt-8">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-primary)]"
          >
            Masuk dengan Google
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-line)]" />
          <span className="text-xs text-[var(--color-muted)]">atau</span>
          <div className="h-px flex-1 bg-[var(--color-line)]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClass}
              placeholder="kamu@email.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass} htmlFor="password">
                Password
              </label>
              <Link
                href="/lupa-password"
                className="mb-1.5 text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Belum punya akun?{' '}
          <Link href="/daftar" className="font-medium text-[var(--color-primary)] hover:underline">
            Daftar
          </Link>
        </p>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </main>
  )
}