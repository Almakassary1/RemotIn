'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react'
import { requestPasswordReset } from './actions'

const inputClass =
  'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15'
const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-ink)]'

export default function LupaPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await requestPasswordReset(formData)
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <MailCheck className="h-7 w-7 text-[var(--color-primary)]" />
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
            Cek Email Kamu
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
            Kalau email itu terdaftar, kami sudah kirim link buat atur ulang password. Klik link
            di email untuk lanjut.
          </p>
          <Link
            href="/masuk"
            className="mt-8 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347]"
          >
            Kembali ke Masuk
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-sm px-6 py-14 sm:py-20">
        <Link
          href="/masuk"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Masuk
        </Link>

        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
          Lupa Password
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Masukkan email akun kamu, kami kirim link buat atur ulang password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Link Reset'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}