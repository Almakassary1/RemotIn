import Image from 'next/image'
import Link from 'next/link'
import type { Category, Job } from '@/lib/types'
import FilterBar from './FilterBar'
import JobCard from './JobCard'
import Sidebar from './Sidebar'
import SearchBox from './SearchBox'

interface JobBoardProps {
  jobs: Job[]
  hasMore: boolean
  loadMoreHref: string
  resultCount: number
  totalActiveJobs: number
  totalCompanies: number
  topJob: Job | null
  categories: Category[]
  // Dipakai halaman /kategori/[slug] agar bisa reuse komponen ini tapi
  // dengan H1 unik per kategori (bagus untuk SEO).
  heroTitle?: string
  heroSubtitle?: string
}

// JobBoard SEKARANG Server Component murni — nggak lagi nyimpen state
// filter sendiri (dulu 'use client' + useState/useMemo). Filtering &
// pagination sudah kelar di server (lihat lib/job-query.ts), komponen
// ini tinggal nampilin `jobs` yang sudah jadi. Interaktivitasnya sendiri
// (kolom cari, dropdown filter) dipecah jadi SearchBox & FilterBar yang
// masing-masing 'use client' sendiri-sendiri — biar JS yang dikirim ke
// browser seminimal mungkin.
export default function JobBoard({
  jobs,
  hasMore,
  loadMoreHref,
  resultCount,
  totalActiveJobs,
  totalCompanies,
  topJob,
  categories,
  heroTitle = 'Kerja dari rumah, tanpa drama macet jalanan.',
  heroSubtitle = 'RemotIn mengurasi lowongan remote & WFH asli untuk talenta Indonesia — dari UI/UX hingga Virtual Assistant.',
}: JobBoardProps) {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* ===== Hero Section ===== */}
      {/* Teal solid, bukan lagi cream — ini identitas RemotIn yang ditegaskan,
          bukan cuma jadi warna aksen kecil. Kartu loker melayang di sisi kanan
          (desktop) SENGAJA selalu topJob (loker unggulan ter-atas se-situs),
          TIDAK ikut berubah waktu user ganti filter — biar nggak lompat-lompat. */}
      <section className="rounded-b-[2.5rem] bg-[var(--color-primary)]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 sm:pb-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_300px]">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                </span>
                <span className="text-sm font-bold text-white">{totalActiveJobs}</span> loker remote
                aktif hari ini
              </span>

              <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                {heroTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base text-[#9FE1CB] sm:text-lg lg:mx-0">
                {heroSubtitle}
              </p>

              <SearchBox />
            </div>

            {topJob && (
              <div className="hidden lg:block">
                <div className="relative mx-auto w-64 -rotate-6">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl bg-black/25"
                  />
                  <Link
                    href={`/jobs/${topJob.id}`}
                    className="relative block rounded-2xl bg-white p-4 shadow-xl transition hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-2.5">
                      {topJob.company_logo ? (
                        <Image
                          src={topJob.company_logo}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 shrink-0 rounded-lg object-contain"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-xs font-semibold text-[#412402]">
                          {topJob.company_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[var(--color-ink)]">
                          {topJob.title}
                        </p>
                        <p className="truncate text-[11px] text-[var(--color-muted)]">
                          {topJob.company_name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[11px] text-[var(--color-muted)]">
                      {topJob.location}
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
            <FilterBar categories={categories} resultCount={resultCount} />

            <div className="mt-6 flex flex-col gap-3">
              {jobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--color-line)] py-16 text-center text-sm text-[var(--color-muted)]">
                  Belum ada loker yang cocok. Coba ubah filter atau kata kunci pencarian.
                </div>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Link
                  href={loadMoreHref}
                  scroll={false}
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-2.5 text-sm font-medium text-[var(--color-ink)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                >
                  Muat Lebih Banyak
                </Link>
              </div>
            )}
          </div>

          <Sidebar totalJobs={totalActiveJobs} totalCompanies={totalCompanies} />
        </div>
      </section>
    </main>
  )
}