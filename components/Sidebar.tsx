'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react'
import { subscribeNewsletter } from '@/app/newsletter/actions'

interface SidebarProps {
  totalJobs: number
  totalCompanies: number
}

export default function Sidebar({ totalJobs, totalCompanies }: SidebarProps) {
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await subscribeNewsletter(formData)

    if (!result.success) {
      setError(result.error ?? 'Gagal mendaftar.')
      setLoading(false)
      return
    }

    setSubscribed(true)
    setLoading(false)
  }

  return (
    <aside className="flex flex-col gap-5">
      {/* Newsletter widget */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[var(--color-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">Dapat Loker Baru Lewat Email</h3>
        </div>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Ringkasan loker remote terbaru, langsung ke inbox kamu.
        </p>

        {subscribed ? (
          <p className="mt-3 flex items-start gap-1.5 text-sm font-medium text-[var(--color-primary)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            Cek inbox kamu — klik link konfirmasi buat mulai terima update loker.
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-3 flex flex-col gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="email@kamu.com"
              className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium tracking-wide text-white shadow-[0_4px_12px_-2px_rgba(14,110,91,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0A5347] hover:shadow-[0_6px_16px_-2px_rgba(14,110,91,0.45)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Daftar Gratis'}
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </form>
        )}
      </div>

      {/* Stat counter — teal, senada dengan Hero, bukan lagi kartu cream */}
      <div className="rounded-2xl bg-[var(--color-primary)] p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold text-white">RemotIn dalam Angka</h3>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-white/60">Loker Aktif</dt>
            <dd className="text-2xl font-semibold text-white">{totalJobs}</dd>
          </div>
          <div>
            <dt className="text-xs text-white/60">Perusahaan</dt>
            <dd className="text-2xl font-semibold text-white">{totalCompanies}</dd>
          </div>
        </dl>
      </div>

      {/* Banner ajakan pasang loker — tetap teal (dulu ink), tombol amber
          biar nge-pop di atas teal, senada bahasa visual Hero */}
      <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white">
        <h3 className="text-sm font-semibold">Punya Lowongan Remote?</h3>
        <p className="mt-1.5 text-xs text-white/70">
          Pasang gratis dan jangkau talenta remote terbaik Indonesia.
        </p>
        <Link
          href="/post-job"
          className="mt-3 inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold tracking-wide text-[#412402] shadow-[0_4px_14px_-2px_rgba(242,169,59,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_-2px_rgba(242,169,59,0.6)] active:translate-y-0 active:scale-[0.98]"
        >
          Pasang Loker Sekarang
        </Link>
      </div>
    </aside>
  )
}