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
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)]">
            <CheckCircle2 className="h-4 w-4" />
            Terdaftar! Terima kasih.
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
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0A5347] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Daftar Gratis'}
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </form>
        )}
      </div>

      {/* Stat counter */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">RemotIn dalam Angka</h3>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-[var(--color-muted)]">Loker Aktif</dt>
            <dd className="text-xl font-semibold text-[var(--color-ink)]">{totalJobs}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-muted)]">Perusahaan</dt>
            <dd className="text-xl font-semibold text-[var(--color-ink)]">{totalCompanies}</dd>
          </div>
        </dl>
      </div>

      {/* Banner ajakan pasang loker */}
      <div className="rounded-2xl bg-[var(--color-ink)] p-5 text-white">
        <h3 className="text-sm font-semibold">Punya Lowongan Remote?</h3>
        <p className="mt-1.5 text-xs text-white/70">
          Pasang gratis dan jangkau talenta remote terbaik Indonesia.
        </p>
        <Link
          href="/post-job"
          className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium text-[var(--color-ink)] transition hover:bg-white/90"
        >
          Pasang Loker Sekarang
        </Link>
      </div>
    </aside>
  )
}