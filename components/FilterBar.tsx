'use client'

import type { Category, JobType } from '@/lib/types'

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Freelance']

interface FilterBarProps {
  categories: Category[]
  activeCategory: string | null
  onCategoryChange: (slug: string | null) => void
  activeJobType: JobType | null
  onJobTypeChange: (type: JobType | null) => void
  resultCount: number
}

export default function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  activeJobType,
  onJobTypeChange,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Filter Kategori */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onCategoryChange(null)} className={pillClass(activeCategory === null)}>
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.slug)}
            className={pillClass(activeCategory === cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter Tipe Pekerjaan + counter */}
      <div className="flex items-center gap-3">
        <select
          value={activeJobType ?? ''}
          onChange={(e) => onJobTypeChange((e.target.value || null) as JobType | null)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">Semua Tipe</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
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
