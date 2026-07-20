import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BadgeCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { getExpiryCutoffISOString } from '@/lib/job-utils'
import { SITE_URL } from '@/lib/site-config'
import JobCard from '@/components/JobCard'
import type { Job } from '@/lib/types'

interface PageProps {
  params: Promise<{ name: string }>
}

// ISR: halaman profil perusahaan di-regenerate tiap 60 detik, sama seperti
// halaman kategori dan detail loker — konsisten dengan pola di seluruh situs.
export const revalidate = 60

// Catatan: tidak ada tabel `companies` terpisah — RemotIn cuma nyimpen
// company_name & company_logo langsung di baris jobs. Jadi "profil
// perusahaan" di sini murni hasil filter jobs berdasarkan company_name,
// bukan entity tersendiri. Kalau nanti butuh field tambahan (deskripsi,
// website, dll), itu perlu tabel companies + migration baru.
async function getCompanyJobs(companyName: string): Promise<Job[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*, categories(*)')
    .eq('company_name', companyName)
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
  const { name } = await params
  const companyName = decodeURIComponent(name)
  const jobs = await getCompanyJobs(companyName)

  if (jobs.length === 0) {
    return { title: 'Perusahaan Tidak Ditemukan — RemotIn' }
  }

  const title = `Loker Remote di ${companyName}`
  const description = `Kumpulan lowongan kerja remote yang tersedia di ${companyName}, dikurasi khusus untuk talenta Indonesia di RemotIn.`

  return {
    title: `${title} — RemotIn`,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/perusahaan/${name}`,
      images: jobs[0].company_logo ? [{ url: jobs[0].company_logo }] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { name } = await params
  const companyName = decodeURIComponent(name)
  const jobs = await getCompanyJobs(companyName)

  // Perusahaan tanpa loker aktif dianggap tidak ditemukan — sama seperti
  // pola loker expired di app/jobs/[id]/page.tsx, supaya nggak ada
  // halaman kosong yang ter-index Google.
  if (jobs.length === 0) {
    notFound()
  }

  // Diambil dari loker terbaru — logo & status verifikasi dianggap
  // berlaku untuk seluruh listing perusahaan yang sama.
  const company = jobs[0]
  const isVerified = jobs.some((job) => job.company_verified)

  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    companyName
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
            src={company.company_logo ?? fallbackLogo}
            alt={companyName}
            width={64}
            height={64}
            className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
                {companyName}
              </h1>
              {isVerified && (
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