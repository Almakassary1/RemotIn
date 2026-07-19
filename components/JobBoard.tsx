'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Job, Category, JobType, WorkArrangement } from '@/lib/types'
import FilterBar from './FilterBar'
import JobCard from './JobCard'
import Sidebar from './Sidebar'

export type SortOption = 'newest' | 'salary'

const PAGE_SIZE = 10

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
  heroTitle = 'Kerja dari rumah, tanpa drama macet jalanan.',
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

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Setiap kali filter/sort berubah, balik ke halaman pertama — supaya
  // hasil "Muat Lebih Banyak" dari pencarian sebelumnya nggak nyangkut
  // dan bikin bingung ("kok cuma 2 dari 30 loker yang muncul?").
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, activeCategory, activeJobType, activeWorkArrangement, minSalary, sortBy])

  const visibleJobs = sortedJobs.slice(0, visibleCount)
  const hasMore = visibleCount < sortedJobs.length

  // Dihitung dari initialJobs (bukan hasil filter) supaya angkanya stabil
  // sebagai gambaran keseluruhan RemotIn, nggak berubah-ubah tiap user ganti filter.
  const totalCompanies = useMemo(
    () => new Set(initialJobs.map((job) => job.company_name)).size,
    [initialJobs]
  )

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* ===== Hero Section ===== */}
      {/* Teal solid, bukan lagi cream — ini identitas RemotIn yang ditegaskan,
          bukan cuma jadi warna aksen kecil. Kartu loker melayang di sisi kanan
          (desktop) pakai loker asli teratas (biasanya Featured, karena
          initialJobs sudah di-sort is_featured dulu di app/page.tsx) — bukan
          ilustrasi dekoratif, biar kelihatan produknya beneran, bukan hiasan. */}
      <section className="bg-[var(--color-primary)]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_300px]">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                </span>
                {initialJobs.length} loker remote aktif hari ini
              </span>

              <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                {heroTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base text-[#9FE1CB] sm:text-lg lg:mx-0">
                {heroSubtitle}
              </p>

              <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-lg lg:mx-0">
                <Search className="h-4 w-4 flex-shrink-0 text-[var(--color-muted)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari posisi atau nama perusahaan..."
                  className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
                />
              </div>
            </div>

            {initialJobs[0] && (
              <div className="hidden lg:block">
                <div className="relative mx-auto w-56 -rotate-3">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-black/15"
                  />
                  <Link
                    href={`/jobs/${initialJobs[0].id}`}
                    className="relative block rounded-2xl bg-white p-4 shadow-xl transition hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-2.5">
                      {initialJobs[0].company_logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={initialJobs[0].company_logo}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg object-contain"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-xs font-semibold text-[#412402]">
                          {initialJobs[0].company_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[var(--color-ink)]">
                          {initialJobs[0].title}
                        </p>
                        <p className="truncate text-[11px] text-[var(--color-muted)]">
                          {initialJobs[0].company_name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[11px] text-[var(--color-muted)]">
                      {initialJobs[0].location}
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Filter + Job List + Sidebar ===== */}
      <section id="kategori" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Konten utama */}
          <div className="min-w-0">
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
                visibleJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Muat Lebih Banyak ({sortedJobs.length - visibleCount} lagi)
                </button>
              </div>
            )}
          </div>

          <Sidebar totalJobs={initialJobs.length} totalCompanies={totalCompanies} />
        </div>
      </section>
    </main>
  )
}