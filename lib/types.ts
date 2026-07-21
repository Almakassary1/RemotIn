export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

// Ditambahkan lewat migrasi add_companies_table (Fix #8 Fase 1) — lihat
// lib/company-service.ts.
export interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  verified: boolean
  created_at: string
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance'

export type WorkArrangement = 'Full Remote' | 'Hybrid'

export interface Job {
  id: string
  title: string
  company_name: string
  company_logo: string | null
  location: string
  job_type: JobType
  work_arrangement: WorkArrangement
  category_id: string | null
  // Ditambahkan lewat migrasi add_companies_table — lihat lib/company-service.ts.
  // Belum dipakai di query manapun sampai Fase 2 (halaman profil perusahaan
  // dipindah ke tabel companies), tapi sudah diisi tiap loker baru dibuat.
  company_id: string | null
  salary_range: string | null
  description: string
  apply_url: string
  is_featured: boolean
  is_approved: boolean
  // Badge "Terverifikasi" — lihat 10_company_verified.sql (Fase D #12)
  company_verified: boolean
  salary_min: number | null
  salary_max: number | null
  created_at: string
  // Ditambahkan untuk Halaman Detail Loker — lihat 02_add_requirements_benefits.sql
  requirements: string[]
  benefits: string[]
  // Skill tags berwarna di kartu loker — lihat 08_job_tags.sql
  tags: string[]
  // Data hasil join dari tabel categories (lihat query `*, categories(*)` di app/page.tsx)
  categories?: Category | null
  // Data hasil join dari tabel companies -- cuma terisi kalau query-nya
  // eksplisit minta `companies(*)` (lihat app/jobs/[id]/page.tsx). Dipakai
  // buat bikin link ke halaman profil perusahaan pakai slug (Fix #8 Fase 2).
  companies?: Company | null
}