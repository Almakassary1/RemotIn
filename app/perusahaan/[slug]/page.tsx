import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowLeft, BadgeCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { getExpiryCutoffISOString } from '@/lib/job-utils'
import { SITE_URL } from '@/lib/site-config'
import JobCard from '@/components/JobCard'
import type { Company, Job } from '@/lib/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

// ISR: halaman profil perusahaan di-regenerate tiap 60 detik, sama seperti
// halaman kategori dan detail loker — konsisten dengan pola di seluruh situs.
export const revalidate = 60

interface ResolvedCompany {
  company: Company
  // true kalau `slug` di URL sebenarnya format LAMA (nama perusahaan
  // mentah, dari sebelum Fix #8 Fase 2) -- bukan slug asli.
  isLegacyUrl: boolean
}

// Cari perusahaan berdasarkan slug (format URL baru, cth: "makro-pro").
// Kalau nggak ketemu, coba anggap parameter itu sebenarnya NAMA
// perusahaan mentah dari format URL LAMA (cth: "Makro PRO") -- supaya
// link lama yang sudah ke-share/ke-bookmark/ke-index Google tetap
// nyampe ke halaman yang benar, bukan malah 404.
async function resolveCompany(rawSlug: string): Promise<ResolvedCompany | null> {
  const supabase = await createClient()

  const { data: bySlug } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', rawSlug)
    .maybeSingle()

  if (bySlug) {
    return { company: bySlug as Company, isLegacyUrl: false }
  }

  const { data: byName } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', rawSlug)
    .maybeSingle()

  if (byName) {
    return { company: byName as Company, isLegacyUrl: true }
  }

  return null
}

async function getCompanyJobs(companyId: string): Promise<Job[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*, categories(*)')
    .eq('company_id', companyId)
    .eq('is_approved', true)
    .gte('created_at', getExpiryCutoffISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gagal mengambil data jobs (profil perusahaan):', error.message)
    return []
  }

  return (data as Job[]) ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolveCompany(slug)

  if (!resolved) {
    return { title: 'Perusahaan Tidak Ditemukan — RemotIn' }
  }

  const { company } = resolved
  const title = `Loker Remote di ${company.name}`
  const description = `Kumpulan lowongan kerja remote yang tersedia di ${company.name}, dikurasi khusus untuk talenta Indonesia di RemotIn.`

  return {
    title: `${title} — RemotIn`,
    description,
    openGraph: {
      title,
      description,
      // SELALU pakai slug asli di sini (bukan `slug` mentah dari URL) --
      // ini yang bikin Google tahu URL "resmi"-nya yang mana walau
      // halaman ini diakses lewat link lama.
      url: `${SITE_URL}/perusahaan/${company.slug}`,
      images: company.logo_url ? [{ url: company.logo_url }] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { slug } = await params
  const resolved = await resolveCompany(slug)

  if (!resolved) {
    notFound()
  }

  const { company, isLegacyUrl } = resolved

  // Link format lama -- alihkan permanen ke URL slug yang benar. Dicek
  // SEBELUM query loker, supaya redirect terjadi secepat mungkin tanpa
  // kerja tambahan yang nggak perlu.
  if (isLegacyUrl) {
    permanentRedirect(`/perusahaan/${company.slug}`)
  }

  const jobs = await getCompanyJobs(company.id)

  // Perusahaan tanpa loker aktif dianggap tidak ditemukan — sama seperti
  // pola loker expired di app/jobs/[id]/page.tsx, supaya nggak ada
  // halaman kosong yang ter-index Google.
  if (jobs.length === 0) {
    notFound()
  }

  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    company.name
  )}&background=0E6E5B&color=fff&size=128`

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Loker
        </Link>

        {/* ===== Header Profil Perusahaan ===== */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8">
          <Image
            src={company.logo_url ?? fallbackLogo}
            alt={company.name}
            width={64}
            height={64}
            className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
                {company.name}
              </h1>
              {company.verified && (
                <BadgeCheck
                  className="h-5 w-5 flex-shrink-0 text-[var(--color-primary)]"
                  aria-label="Perusahaan terverifikasi"
                />
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {jobs.length} loker remote aktif
            </p>
          </div>
        </div>

        {/* ===== Daftar Loker ===== */}
        <div className="mt-8 flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </main>
  )
}