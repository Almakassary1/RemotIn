'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/lib/types'
import { JOB_TYPES, WORK_ARRANGEMENTS } from '@/lib/job-query'

const MIN_SALARY_OPTIONS = [
  { label: 'Semua Gaji', value: 0 },
  { label: 'Rp 5 juta+', value: 5_000_000 },
  { label: 'Rp 10 juta+', value: 10_000_000 },
  { label: 'Rp 15 juta+', value: 15_000_000 },
  { label: 'Rp 20 juta+', value: 20_000_000 },
]

interface FilterBarProps {
  categories: Category[]
  resultCount: number
}

// FilterBar sekarang "swasembada" — baca nilai filter aktif langsung
// dari URL (bukan dari props/state parent), dan tiap filter diubah,
// dia yang navigasi ke URL baru. Sumber kebenarannya cuma satu: URL.
export default function FilterBar({ categories, resultCount }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Kategori aktif bisa datang dari path /kategori/<slug> (link "cantik"
  // buat SEO) ATAU dari query string ?kategori=<slug> (dipakai kalau
  // lagi nge-filter dari halaman selain /kategori/...). Path menang
  // kalau dua-duanya somehow ada.
  const routeCategoryMatch = pathname.match(/^\/kategori\/([^/]+)/)
  const activeCategory = routeCategoryMatch
    ? decodeURIComponent(routeCategoryMatch[1])
    : searchParams.get('kategori')

  const activeJobType = searchParams.get('tipe')
  const activeWorkArrangement = searchParams.get('susunan')
  const minSalary = Number(searchParams.get('gaji') ?? '0') || 0
  const sortBy = searchParams.get('urutan') === 'gaji' ? 'gaji' : 'terbaru'

  function categoryHref(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('kategori')
    params.delete('jumlah')
    const qs = params.toString()
    const base = slug ? `/kategori/${encodeURIComponent(slug)}` : '/'
    return qs ? `${base}?${qs}` : base
  }

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('jumlah') // balik ke halaman pertama tiap filter berubah
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      {/* Filter Kategori */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={categoryHref(null)} className={pillClass(activeCategory === null)}>
          Semua Kategori
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={categoryHref(cat.slug)}
            className={pillClass(activeCategory === cat.slug)}
          >
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Filter Tipe Pekerjaan + Arrangement + Gaji + Sort + counter */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={activeJobType ?? ''}
          onChange={(e) => updateParam('tipe', e.target.value || null)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
        >
          <option value="">Semua Tipe</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={activeWorkArrangement ?? ''}
          onChange={(e) => updateParam('susunan', e.target.value || null)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
        >
          <option value="">Remote & Hybrid</option>
          {WORK_ARRANGEMENTS.map((arrangement) => (
            <option key={arrangement} value={arrangement}>
              {arrangement}
            </option>
          ))}
        </select>
        <select
          value={minSalary}
          onChange={(e) => updateParam('gaji', e.target.value === '0' ? null : e.target.value)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
        >
          {MIN_SALARY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => updateParam('urutan', e.target.value === 'gaji' ? 'gaji' : null)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
        >
          <option value="terbaru">Terbaru</option>
          <option value="gaji">Gaji Tertinggi</option>
        </select>
        <span className="whitespace-nowrap text-sm text-[var(--color-muted)]">
          <strong className="text-[var(--color-ink)]">{resultCount}</strong> loker
        </span>
      </div>
    </div>
  )
}

function pillClass(active: boolean) {
  return `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
    active
      ? 'bg-[var(--color-primary)] text-white'
      : 'border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
  }`
}