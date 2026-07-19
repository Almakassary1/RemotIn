'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { updatePassword } from './actions'
import Toast from '@/components/Toast'

const inputClass =
  'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15'
const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-ink)]'

export default function AturUlangPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const result = await updatePassword(formData)

    setLoading(false)
    if (!result.success) {
      setToast({ type: 'error', message: result.error ?? 'Gagal mengatur ulang password.' })
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-[var(--color-primary)]" />
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
            Password Berhasil Diubah
          </h1>
          <a
            href="/"
            className="mt-8 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347]"
          >
            Ke Beranda
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-sm px-6 py-14 sm:py-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
          Atur Ulang Password
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Masukkan password baru kamu.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className={labelClass} htmlFor="password">
              Password Baru
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className={inputClass}
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="confirm_password">
              Konfirmasi Password Baru
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              className={inputClass}
              placeholder="Ulangi password baru"
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
                Menyimpan...
              </>
            ) : (
              'Simpan Password Baru'
            )}
          </button>
        </form>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </main>
  )
}