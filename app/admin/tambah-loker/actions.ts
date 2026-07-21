'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/utils/supabase/admin'
import { upsertCompany } from '@/lib/company-service'

interface AddJobResult {
  success: boolean
  error?: string
  jobId?: string
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function commaToArray(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatSalaryRange(min: string, max: string): string | null {
  const minNum = min ? Number(min) : null
  const maxNum = max ? Number(max) : null
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  if (minNum && maxNum) return `${fmt(minNum)} - ${fmt(maxNum)}`
  if (minNum) return `Mulai ${fmt(minNum)}`
  if (maxNum) return `Hingga ${fmt(maxNum)}`
  return null
}

// Beda dari submitJob (app/post-job/actions.ts):
// - Tidak ada honeypot / Turnstile — yang mengisi form ini sudah admin
//   ter-otentikasi lewat cookie sesi, bukan pengguna publik anonim.
// - is_approved di-set true langsung — loker tayang tanpa moderasi,
//   karena ini adalah pintu masuk kurasi manual admin sendiri (dipakai
//   juga di Fase B untuk isi 20-30 loker asli).
// - Pakai createAdminClient() (service role), BUKAN client biasa, karena
//   migration 04 memperketat RLS: insert publik hanya boleh dengan
//   is_approved=false. Insert dengan is_approved=true harus lewat
//   service role yang bypass RLS — sama seperti toggleApproved dkk.
export async function addJob(formData: FormData): Promise<AddJobResult> {
  await requireAdmin()

  const title = formData.get('title')?.toString().trim() ?? ''
  const companyName = formData.get('company_name')?.toString().trim() ?? ''
  const companyLogo = formData.get('company_logo')?.toString().trim() ?? ''
  const categoryId = formData.get('category_id')?.toString() ?? ''
  const jobType = formData.get('job_type')?.toString() ?? ''
  const workArrangement = formData.get('work_arrangement')?.toString() || 'Full Remote'
  const location = formData.get('location')?.toString().trim() || 'Remote - Indonesia'
  const salaryMin = formData.get('salary_min')?.toString() ?? ''
  const salaryMax = formData.get('salary_max')?.toString() ?? ''
  const applyUrl = formData.get('apply_url')?.toString().trim() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const requirements = formData.get('requirements')?.toString() ?? ''
  const benefits = formData.get('benefits')?.toString() ?? ''
  const tags = formData.get('tags')?.toString() ?? ''
  const isFeatured = formData.get('is_featured') === 'on'

  // Validasi server-side — sama seperti submitJob, tetap divalidasi ulang
  // di sini walau form sudah punya `required` di HTML.
  if (!title || !companyName || !categoryId || !jobType || !location || !applyUrl || !description) {
    return { success: false, error: 'Ada kolom wajib yang belum terisi.' }
  }
  if (!isValidUrl(applyUrl)) {
    return { success: false, error: 'Link Form Lamaran / Email harus berupa URL yang valid.' }
  }
  if (workArrangement !== 'Full Remote' && workArrangement !== 'Hybrid') {
    return { success: false, error: 'Susunan kerja tidak valid.' }
  }
  if (companyLogo && !isValidUrl(companyLogo)) {
    return { success: false, error: 'URL Logo Perusahaan tidak valid.' }
  }
  if (title.length > 150 || companyName.length > 150) {
    return { success: false, error: 'Judul posisi atau nama perusahaan terlalu panjang.' }
  }
  if (description.length > 5000) {
    return { success: false, error: 'Deskripsi pekerjaan terlalu panjang (maksimal 5000 karakter).' }
  }

  const supabase = createAdminClient()

  // Sambungkan ke tabel companies (dibuat kalau belum ada, disambungkan
  // kalau nama yang sama sudah pernah posting loker lain sebelumnya).
  const companyId = await upsertCompany(supabase, {
    name: companyName,
    logoUrl: companyLogo || null,
  })

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title,
      company_name: companyName,
      company_logo: companyLogo || null,
      company_id: companyId,
      category_id: categoryId || null,
      job_type: jobType,
      work_arrangement: workArrangement,
      location,
      salary_range: formatSalaryRange(salaryMin, salaryMax),
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      apply_url: applyUrl,
      description,
      requirements: linesToArray(requirements),
      benefits: linesToArray(benefits),
      tags: commaToArray(tags),
      is_approved: true,
      is_featured: isFeatured,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Gagal menambah loker (admin):', error.message)
    return { success: false, error: 'Gagal menyimpan loker. Silakan coba lagi.' }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/jobs/[id]', 'page')

  return { success: true, jobId: data.id }
}