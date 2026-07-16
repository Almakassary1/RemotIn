import Link from 'next/link'
import { SearchX } from 'lucide-react'

// Otomatis dirender saat notFound() dipanggil di page.tsx (mis. id tidak
// ditemukan di database, atau formatnya bukan UUID yang valid).
export default function JobNotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[var(--color-bg)] px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-line)]">
        <SearchX className="h-6 w-6 text-[var(--color-muted)]" />
      </span>
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
        Loker tidak ditemukan
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
        Lowongan ini mungkin sudah ditutup atau tautannya tidak valid. Coba cari loker lain yang
        masih aktif.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A5347]"
      >
        Kembali ke Daftar Loker
      </Link>
    </main>
  )
}
