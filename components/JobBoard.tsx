'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Job, Category, JobType, WorkArrangement } from '@/lib/types'
import FilterBar from './FilterBar'
import JobCard from './JobCard'

export type SortOption = 'newest' | 'salary'

interface JobBoardProps {
  initialJobs: Job[]
  categories: Category[]
  // Ketiganya opsional — dipakai halaman /kategori/[slug] agar bisa
  // reuse komponen ini tapi dengan H1 unik per kategori (bagus untuk SEO)
  // dan filter kategori yang sudah ter-pilih dari awal.
  initialCategorySlug?: string | null
  heroTitle?: string
  heroSubtitle?: string
}

export default function JobBoard({
  initialJobs,
  categories,
  initialCategorySlug = null,
  heroTitle = 'Kerja dari rumah, tanpa drama macet Jakarta.',
  heroSubtitle = 'RemotIn mengurasi lowongan remote & WFH asli untuk talenta Indonesia — dari UI/UX hingga Virtual Assistant.',
}: JobBoardProps) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategorySlug)
  const [activeJobType, setActiveJobType] = useState<JobType | null>(null)
  const [activeWorkArrangement, setActiveWorkArrangement] = useState<WorkArrangement | null>(null)
  const [minSalary, setMinSalary] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Filtering dilakukan di client karena data sudah di-fetch sekaligus dari server.
  // Untuk skala data yang lebih besar nanti, ini bisa dipindah jadi query Supabase
  // dengan .ilike() / .eq() di server.
  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase()

    return initialJobs.filter((job) => {
      const matchesQuery =
        q === '' ||
        job.title.toLowerCase().includes(q) ||
        job.company_name.toLowerCase().includes(q)

      const matchesCategory = activeCategory === null || job.categories?.slug === activeCategory
      const matchesJobType = activeJobType === null || job.job_type === activeJobType
      const matchesWorkArrangement =
        activeWorkArrangement === null || job.work_arrangement === activeWorkArrangement
      // Loker tanpa gaji dicantumkan (salary_max & salary_min null) otomatis
      // tersembunyi begitu minSalary > 0 — nggak ada cara pastikan mereka
      // qualify, jadi lebih aman dianggap tidak memenuhi filter.
      const matchesSalary =
        minSalary === 0 || (job.salary_max ?? job.salary_min ?? 0) >= minSalary

      return matchesQuery && matchesCategory && matchesJobType && matchesWorkArrangement && matchesSalary
    })
  }, [initialJobs, query, activeCategory, activeJobType, activeWorkArrangement, minSalary])

  // "newest" sengaja tidak di-sort ulang di sini — initialJobs sudah datang
  // dari server dalam urutan featured dulu, lalu created_at terbaru (lihat
  // app/page.tsx), jadi urutan itu otomatis kepakai lagi begitu sortBy
  // dibalik ke "newest". Cuma "salary" yang butuh sorting eksplisit.
  const sortedJobs = useMemo(() => {
    if (sortBy !== 'salary') return filteredJobs

    return [...filteredJobs].sort((a, b) => {
      const salaryA = a.salary_max ?? a.salary_min ?? -1
      const salaryB = b.salary_max ?? b.salary_min ?? -1
      return salaryB - salaryA
    })
  }, [filteredJobs, sortBy])

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* ===== Hero Section ===== */}
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
          </span>
          {initialJobs.length} loker remote aktif hari ini
        </span>

        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-medium leading-tight text-[var(--color-ink)] sm:text-5xl">
          {heroTitle}
        </h1>
        <p className="mt-4 text-base text-[var(--color-muted)] sm:text-lg">{heroSubtitle}</p>

        <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 pl-4 shadow-sm">
          <Search className="h-4 w-4 flex-shrink-0 text-[var(--color-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari posisi atau nama perusahaan..."
            className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
          />
        </div>
      </section>

      {/* ===== Filter + Job List ===== */}
      <section id="kategori" className="mx-auto max-w-3xl scroll-mt-24 px-6 pb-24">
        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeJobType={activeJobType}
          onJobTypeChange={setActiveJobType}
          activeWorkArrangement={activeWorkArrangement}
          onWorkArrangementChange={setActiveWorkArrangement}
          minSalary={minSalary}
          onMinSalaryChange={setMinSalary}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={sortedJobs.length}
        />

        <div className="mt-6 flex flex-col gap-3">
          {sortedJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-line)] py-16 text-center text-sm text-[var(--color-muted)]">
              Belum ada loker yang cocok. Coba ubah filter atau kata kunci pencarian.
            </div>
          ) : (
            sortedJobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </section>
    </main>
  )
}