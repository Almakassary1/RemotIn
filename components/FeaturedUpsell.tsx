'use client'

import { useState } from 'react'
import Script from 'next/script'
import { Star, Loader2 } from 'lucide-react'
import { createFeaturedPayment } from '@/app/post-job/payment-actions'
import { FEATURED_PRICE, FEATURED_DURATION_LABEL } from '@/lib/payment-config'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void
    }
  }
}

const SNAP_JS_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'

export default function FeaturedUpsell({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setStatus('idle')

    const result = await createFeaturedPayment(jobId)

    if (!result.success || !result.snapToken) {
      setErrorMessage(result.error ?? 'Gagal memulai pembayaran.')
      setStatus('error')
      setLoading(false)
      return
    }

    window.snap?.pay(result.snapToken, {
      onSuccess: () => {
        setStatus('success')
        setLoading(false)
      },
      onPending: () => {
        // Anggap sukses secara UX (mis. transfer bank butuh waktu) — status
        // final tetap ditentukan webhook, bukan callback ini.
        setStatus('success')
        setLoading(false)
      },
      onError: () => {
        setErrorMessage('Pembayaran gagal. Silakan coba lagi.')
        setStatus('error')
        setLoading(false)
      },
      onClose: () => {
        setLoading(false)
      },
    })
  }

  if (status === 'success') {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left text-sm text-amber-800">
        Pembayaran diterima! Lokermu akan tampil sebagai <strong>Featured</strong> begitu selesai
        diproses (biasanya beberapa menit setelah loker disetujui admin).
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-left">
      <Script src={SNAP_JS_URL} data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />

      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <Star className="h-4 w-4 text-amber-600" />
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">
            Mau lokermu lebih menonjol?
          </h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Upgrade ke <strong>Featured</strong> — tampil di posisi teratas selama{' '}
            {FEATURED_DURATION_LABEL}, seharga Rp {FEATURED_PRICE.toLocaleString('id-ID')}.
          </p>

          {status === 'error' && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            {loading ? 'Memproses...' : 'Upgrade ke Featured'}
          </button>
        </div>
      </div>
    </div>
  )
}