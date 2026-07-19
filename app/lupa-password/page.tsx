'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { requestPasswordReset, resetPasswordWithOtp, resendResetOtp } from './actions'
import Toast from '@/components/Toast'

const inputClass =
  'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15'
const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-ink)]'

export default function LupaPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleRequestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')?.toString().trim() ?? ''
    await requestPasswordReset(formData)
    setLoading(false)
    setSubmittedEmail(email)
  }

  async function handleResetSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setToast(null)
    const formData = new FormData(e.currentTarget)
    const result = await resetPasswordWithOtp(formData)
    setLoading(false)
    if (!result.success) {
      setToast({ type: 'error', message: result.error ?? 'Gagal mengatur ulang password.' })
      return
    }
    setDone(true)
  }

  async function handleResend() {
    if (!submittedEmail) return
    setResending(true)
    const result = await resendResetOtp(submittedEmail)
    setResending(false)
    setToast({
      type: result.success ? 'success' : 'error',
      message: result.success ? 'Kode baru sudah dikirim.' : (result.error ?? 'Gagal kirim ulang.'),
    })
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
          <Link
            href="/masuk"
            className="mt-8 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium tracking-wide text-white shadow-[0_4px_14px_-2px_rgba(14,110,91,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0A5347] hover:shadow-[0_6px_18px_-2px_rgba(14,110,91,0.5)] active:translate-y-0 active:scale-[0.98]"
          >
            Ke Halaman Masuk
          </Link>
        </div>
      </main>
    )
  }

  if (submittedEmail) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto max-w-sm px-6 py-14 sm:py-20">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
            Masukkan Kode & Password Baru
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Kami kirim kode verifikasi ke{' '}
            <span className="font-medium text-[var(--color-ink)]">{submittedEmail}</span>.
          </p>

          <form onSubmit={handleResetSubmit} className="mt-8 flex flex-col gap-4">
            <input type="hidden" name="email" value={submittedEmail} />
            <div>
              <label className={labelClass} htmlFor="token">
                Kode Verifikasi
              </label>
              <input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6,10}"
                maxLength={10}
                required
                autoFocus
                placeholder="Kode dari email"
                className={`${inputClass} text-center text-lg tracking-[0.3em]`}
              />
            </div>
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
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium tracking-wide text-white shadow-[0_4px_14px_-2px_rgba(14,110,91,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0A5347] hover:shadow-[0_6px_18px_-2px_rgba(14,110,91,0.5)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

          <button
            onClick={handleResend}
            disabled={resending}
            className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline disabled:opacity-60"
          >
            {resending ? 'Mengirim...' : 'Kirim ulang kode'}
          </button>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
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
          Masukkan email akun kamu, kami kirim kode buat atur ulang password.
        </p>

        <form onSubmit={handleRequestSubmit} className="mt-8 flex flex-col gap-4">
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
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium tracking-wide text-white shadow-[0_4px_14px_-2px_rgba(14,110,91,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0A5347] hover:shadow-[0_6px_18px_-2px_rgba(14,110,91,0.5)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Kode Reset'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}