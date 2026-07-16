'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error'
  message: string
  onClose: () => void
}

export default function Toast({ type, message, onClose }: ToastProps) {
  // Auto-dismiss hanya untuk error. Toast sukses sengaja tidak auto-dismiss
  // karena halaman akan segera redirect (lihat PostJobForm.tsx).
  useEffect(() => {
    if (type !== 'error') return
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [type, onClose])

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]"
    >
      {type === 'success' ? (
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
      ) : (
        <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
      )}
      <p className="flex-1 text-sm leading-relaxed text-[var(--color-ink)]">{message}</p>
      <button
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="flex-shrink-0 text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
