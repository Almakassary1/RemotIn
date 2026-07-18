'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/utils/supabase/admin'

interface UpdateJobResult {
  success: boolean
  error?: string
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

// Beda dari addJob (app/admin/tambah-loker/actions.ts): ini UPDATE baris yang
// sudah ada (.eq('id', jobId)), bukan INSERT baris baru. is_approved dan
// is_featured sengaja TIDAK disentuh di sini — dua status itu sudah punya
// jalur sendiri (tombol Aktif/Nonaktif dan Featured/Standar di JobRow.tsx),
// supaya tidak ada dua cara berbeda mengubah field yang sama.
export async function updateJob(jobId: string, formData: FormData): Promise<UpdateJobResult> {
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

  const { error } = await supabase
    .from('jobs')
    .update({
      title,
      company_name: companyName,
      company_logo: companyLogo || null,
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
    })
    .eq('id', jobId)

  if (error) {
    console.error('Gagal update loker (admin):', error.message)
    return { success: false, error: 'Gagal menyimpan perubahan. Silakan coba lagi.' }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/jobs/[id]', 'page')

  return { success: true }
}