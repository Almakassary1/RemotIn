'use client'

import type { Category, JobType, WorkArrangement } from '@/lib/types'
import type { SortOption } from './JobBoard'

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Freelance']
const WORK_ARRANGEMENTS: WorkArrangement[] = ['Full Remote', 'Hybrid']
const MIN_SALARY_OPTIONS = [
  { label: 'Semua Gaji', value: 0 },
  { label: 'Rp 5 juta+', value: 5_000_000 },
  { label: 'Rp 10 juta+', value: 10_000_000 },
  { label: 'Rp 15 juta+', value: 15_000_000 },
  { label: 'Rp 20 juta+', value: 20_000_000 },
]

interface FilterBarProps {
  categories: Category[]
  activeCategory: string | null
  onCategoryChange: (slug: string | null) => void
  activeJobType: JobType | null
  onJobTypeChange: (type: JobType | null) => void
  activeWorkArrangement: WorkArrangement | null
  onWorkArrangementChange: (arrangement: WorkArrangement | null) => void
  minSalary: number
  onMinSalaryChange: (value: number) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  resultCount: number
}

export default function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  activeJobType,
  onJobTypeChange,
  activeWorkArrangement,
  onWorkArrangementChange,
  minSalary,
  onMinSalaryChange,
  sortBy,
  onSortChange,
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
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter Tipe Pekerjaan + Arrangement + Gaji + Sort + counter */}
      <div className="flex flex-wrap items-center gap-3">
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
        <select
          value={activeWorkArrangement ?? ''}
          onChange={(e) =>
            onWorkArrangementChange((e.target.value || null) as WorkArrangement | null)
          }
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
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
          onChange={(e) => onMinSalaryChange(Number(e.target.value))}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
        >
          {MIN_SALARY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
        >
          <option value="newest">Terbaru</option>
          <option value="salary">Gaji Tertinggi</option>
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