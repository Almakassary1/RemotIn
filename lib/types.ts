export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance'

export interface Job {
  id: string
  title: string
  company_name: string
  company_logo: string | null
  location: string
  job_type: JobType
  category_id: string | null
  salary_range: string | null
  description: string
  apply_url: string
  is_featured: boolean
  is_approved: boolean
  salary_min: number | null
  salary_max: number | null
  created_at: string
  // Ditambahkan untuk Halaman Detail Loker — lihat 02_add_requirements_benefits.sql
  requirements: string[]
  benefits: string[]
  // Data hasil join dari tabel categories (lihat query `*, categories(*)` di app/page.tsx)
  categories?: Category | null
}
