'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, MailCheck } from 'lucide-react'
import { signUpWithPassword, verifySignupOtp, resendSignupOtp } from './actions'
import { signInWithGoogle } from '@/app/masuk/actions'
import Toast from '@/components/Toast'

const inputClass =
  'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15'
const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-ink)]'

export default function DaftarPage() {
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')?.toString().trim() ?? ''
    const result = await signUpWithPassword(formData)

    setLoading(false)
    if (!result.success) {
      setToast({ type: 'error', message: result.error ?? 'Gagal mendaftar. Silakan coba lagi.' })
      return
    }

    setSubmittedEmail(email)
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const result = await verifySignupOtp(formData)

    if (!result.success) {
      setToast({ type: 'error', message: result.error ?? 'Kode salah.' })
      setLoading(false)
      return
    }

    // Full navigation sengaja dipakai supaya layout server (Navbar) dan
    // AuthSync ikut mount ulang dengan sesi terbaru.
    window.location.href = '/'
  }

  async function handleResend() {
    if (!submittedEmail) return
    setResending(true)
    const result = await resendSignupOtp(submittedEmail)
    setResending(false)
    setToast({
      type: result.success ? 'success' : 'error',
      message: result.success ? 'Kode baru sudah dikirim.' : (result.error ?? 'Gagal kirim ulang.'),
    })
  }

  if (submittedEmail) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <MailCheck className="h-7 w-7 text-[var(--color-primary)]" />
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
            Masukkan Kode Verifikasi
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
            Kami kirim kode verifikasi ke{' '}
            <span className="font-medium text-[var(--color-ink)]">{submittedEmail}</span>.
          </p>

          <form onSubmit={handleVerify} className="mt-6 w-full">
            <input type="hidden" name="email" value={submittedEmail} />
            <input
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
            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Verifikasi'
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
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
            Daftar RemotIn
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Gratis. Loker tersimpan kamu bakal sinkron di semua device.
          </p>
        </div>

        <form action={signInWithGoogle} className="mt-8">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-primary)]"
          >
            Daftar dengan Google
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
            <label className={labelClass} htmlFor="password">
              Password
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
              Konfirmasi Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              className={inputClass}
              placeholder="Ulangi password"
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
              'Daftar'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Sudah punya akun?{' '}
          <Link href="/masuk" className="font-medium text-[var(--color-primary)] hover:underline">
            Masuk
          </Link>
        </p>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </main>
  )
}