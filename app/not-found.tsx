import Link from 'next/link'
import { Compass } from 'lucide-react'

// Otomatis dirender Next.js untuk route mana pun yang tidak cocok di
// seluruh situs. Beda dengan app/jobs/[id]/not-found.tsx yang cuma
// berlaku khusus di dalam segment /jobs/[id].
export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[var(--color-bg)] px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
        <Compass className="h-6 w-6 text-[var(--color-muted)]" />
      </span>
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
        Halaman yang kamu cari sepertinya tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A5347]"
      >
        Kembali ke Beranda
      </Link>
    </main>
  )
}