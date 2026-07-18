import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Briefcase, Wallet, CalendarDays, Layers, Building2, BadgeCheck } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import SaveJobButton from '@/components/SaveJobButton'
import { createClient } from '@/utils/supabase/server'
import { getExpiryCutoffISOString, buildJobPostingSchema, isJobHot } from '@/lib/job-utils'
import { SITE_URL } from '@/lib/site-config'
import type { Job } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

// ISR: halaman detail di-regenerate tiap 60 detik
export const revalidate = 60

// Catatan: query Supabase di sini dan di bawah (JobDetailPage) sama persis.
// Next.js otomatis men-dedupe fetch dengan input identik dalam satu request,
// jadi ini TIDAK menghasilkan 2x query ke database.
async function getJob(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*, categories(*)')
    .eq('id', id)
    .eq('is_approved', true)
    .gte('created_at', getExpiryCutoffISOString()) // loker >30 hari dianggap tidak ditemukan
    .single()

  if (error || !data) return null
  return data as Job
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const job = await getJob(id)

  if (!job) {
    return { title: 'Loker Tidak Ditemukan — RemotIn' }
  }

  const title = `${job.title} di ${job.company_name}`
  const description = `Lowongan remote ${job.title} di ${job.company_name}. Lokasi: ${job.location}. Lamar sekarang di RemotIn.`

  return {
    title: `${title} — RemotIn`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/jobs/${job.id}`,
      images: job.company_logo ? [{ url: job.company_logo }] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params
  const job = await getJob(id)

  if (!job) {
    notFound()
  }

  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    job.company_name
  )}&background=0E6E5B&color=fff&size=128`

  const postedDate = new Date(job.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shareText = `Loker ${job.title} di ${job.company_name} — cek di RemotIn: ${SITE_URL}/jobs/${job.id}`
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Structured data untuk Google for Jobs — tidak terlihat di halaman,
          cuma dibaca oleh crawler mesin pencari. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJobPostingSchema(job)) }}
      />
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Loker
        </Link>

        {/* ===== Header Loker ===== */}
        <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <img
              src={job.company_logo ?? fallbackLogo}
              alt={job.company_name}
              className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
            />
            <div>
              {(job.is_featured || isJobHot(job.created_at)) && (
                <div className="mb-2 flex gap-1.5">
                  {job.is_featured && (
                    <span className="inline-block rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[11px] font-semibold text-[#3A2400]">
                      Featured
                    </span>
                  )}
                  {isJobHot(job.created_at) && (
                    <span className="inline-block rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      🔥 Hot
                    </span>
                  )}
                </div>
              )}
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-[var(--color-ink)] sm:text-3xl">
                {job.title}
              </h1>
              <Link
                href={`/perusahaan/${encodeURIComponent(job.company_name)}`}
                className="mt-1 flex items-center gap-1.5 text-[15px] text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
              >
                {job.company_name}
                {job.company_verified && (
                  <BadgeCheck
                    className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]"
                    aria-label="Perusahaan terverifikasi"
                  />
                )}
              </Link>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                  </span>
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.job_type}
                </span>
                {job.salary_range && (
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5" />
                    {job.salary_range}
                  </span>
                )}
              </div>
            </div>
          </div>

          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            Lamar Sekarang
          </a>
        </div>

        {/* ===== Content grid: Bodi Utama + Sidebar ===== */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Bodi Utama */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section>
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">Deskripsi Pekerjaan</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[var(--color-muted)]">
                {job.description}
              </p>
            </section>

            {job.tags?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">Skill & Tags</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-sm font-medium text-[var(--color-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {job.requirements?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                  Kualifikasi &amp; Persyaratan
                </h2>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {job.requirements.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[var(--color-muted)]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.benefits?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">Benefit</h2>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {job.benefits.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[var(--color-muted)]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar Info Ringkas */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Info Loker
              </h3>
              <dl className="mt-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <dt className="text-xs text-[var(--color-muted)]">Diposting</dt>
                    <dd className="text-sm font-medium text-[var(--color-ink)]">{postedDate}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <dt className="text-xs text-[var(--color-muted)]">Tipe Pekerjaan</dt>
                    <dd className="text-sm font-medium text-[var(--color-ink)]">{job.job_type}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <dt className="text-xs text-[var(--color-muted)]">Susunan Kerja</dt>
                    <dd className="text-sm font-medium text-[var(--color-ink)]">
                      {job.work_arrangement}
                    </dd>
                  </div>
                </div>
                {job.categories && (
                  <div className="flex items-start gap-3">
                    <Layers className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                    <div>
                      <dt className="text-xs text-[var(--color-muted)]">Kategori</dt>
                      <dd className="text-sm font-medium text-[var(--color-ink)]">
                        {job.categories.name}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Tentang Perusahaan
              </h3>
              <Link
                href={`/perusahaan/${encodeURIComponent(job.company_name)}`}
                className="mt-3 flex items-center gap-3 rounded-xl transition hover:opacity-80"
              >
                <img
                  src={job.company_logo ?? fallbackLogo}
                  alt={job.company_name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <p className="text-sm font-medium text-[var(--color-ink)]">{job.company_name}</p>
              </Link>
            </div>

            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--color-primary)] px-6 py-3 text-center text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              Lamar Sekarang
            </a>

            <SaveJobButton jobId={job.id} />

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[#25D366] hover:text-[#25D366]"
            >
              <FaWhatsapp className="h-4 w-4" />
              Bagikan ke WhatsApp
            </a>
          </aside>
        </div>
      </div>
    </main>
  )
}