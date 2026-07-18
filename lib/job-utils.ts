// Aturan masa aktif loker: loker otomatis tidak tampil ke publik setelah
// sekian hari, supaya listing tidak basi. Dipakai di app/page.tsx,
// app/jobs/[id]/page.tsx (sembunyikan dari publik), dan badge "Expired"
// di admin dashboard (tetap kelihatan buat admin, cuma ditandai).
export const JOB_EXPIRY_DAYS = 30

export function isJobExpired(createdAt: string): boolean {
  const createdTime = new Date(createdAt).getTime()
  const ageInDays = (Date.now() - createdTime) / (1000 * 60 * 60 * 24)
  return ageInDays > JOB_EXPIRY_DAYS
}

// ISO string untuk dipakai di query Supabase: .gte('created_at', cutoff)
export function getExpiryCutoffISOString(): string {
  return new Date(Date.now() - JOB_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

// "HOT" = loker yang baru diposting dalam 24 jam terakhir — sinyal ke
// pencari kerja bahwa ini kesempatan yang masih fresh, kompetisi pelamar
// biasanya masih rendah. Dihitung dari created_at, nggak butuh data baru.
export function isJobHot(createdAt: string): boolean {
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  return ageInHours <= 24
}

// Format tanggal relatif ("2 hari lalu") untuk JobCard — dipakai di
// tampilan list, bukan halaman detail (yang tetap pakai tanggal absolut
// lengkap supaya jelas kapan persisnya loker diposting).
// Loker maksimal berumur 30 hari (lihat JOB_EXPIRY_DAYS), jadi unit
// terbesar yang realistis muncul di sini adalah "minggu", tidak perlu
// sampai "bulan".
export function formatRelativeDate(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays >= 1) {
    if (diffDays === 1) return 'Kemarin'
    if (diffDays < 7) return `${diffDays} hari lalu`
    const diffWeeks = Math.floor(diffDays / 7)
    return diffWeeks === 1 ? '1 minggu lalu' : `${diffWeeks} minggu lalu`
  }
  if (diffHours >= 1) return `${diffHours} jam lalu`
  if (diffMinutes >= 1) return `${diffMinutes} menit lalu`
  return 'Baru saja'
}

// =====================================================================
// JSON-LD JobPosting — syarat wajib supaya loker bisa muncul di Google
// for Jobs. Referensi: https://developers.google.com/search/docs/appearance/structured-data/job-posting
// =====================================================================
import type { Job } from './types'

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  'Full-time': 'FULL_TIME',
  'Part-time': 'PART_TIME',
  Contract: 'CONTRACTOR',
  Freelance: 'CONTRACTOR',
}

export function buildJobPostingSchema(job: Job) {
  const datePosted = new Date(job.created_at)
  const validThrough = new Date(datePosted.getTime() + JOB_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: 'RemotIn',
      value: job.id,
    },
    datePosted: datePosted.toISOString(),
    validThrough: validThrough.toISOString(),
    employmentType: EMPLOYMENT_TYPE_MAP[job.job_type] ?? 'OTHER',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
      ...(job.company_logo ? { logo: job.company_logo } : {}),
    },
    // Loker remote: pakai jobLocationType + applicantLocationRequirements,
    // bukan jobLocation (alamat fisik) — ini yang direkomendasikan Google
    // khusus untuk lowongan remote.
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'Indonesia',
    },
    directApply: true,
  }

  if (job.salary_min || job.salary_max) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'IDR',
      value: {
        '@type': 'QuantitativeValue',
        ...(job.salary_min ? { minValue: job.salary_min } : {}),
        ...(job.salary_max ? { maxValue: job.salary_max } : {}),
        unitText: 'MONTH',
      },
    }
  }

  return schema
}