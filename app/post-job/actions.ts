'use server'

import { createClient } from '@/utils/supabase/server'

interface SubmitJobResult {
  success: boolean
  error?: string
  jobId?: string
}

interface TurnstileVerifyResponse {
  success: boolean
  [key: string]: unknown
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY belum di-set di .env.local — submission ditolak.')
    return false
  }
  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    })
    const data: TurnstileVerifyResponse = await res.json()
    return data.success === true
  } catch (err) {
    console.error('Gagal memverifikasi Turnstile:', err)
    return false
  }
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

function formatSalaryRange(min: string, max: string): string | null {
  const minNum = min ? Number(min) : null
  const maxNum = max ? Number(max) : null
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  if (minNum && maxNum) return `${fmt(minNum)} - ${fmt(maxNum)}`
  if (minNum) return `Mulai ${fmt(minNum)}`
  if (maxNum) return `Hingga ${fmt(maxNum)}`
  return null
}

export async function submitJob(formData: FormData): Promise<SubmitJobResult> {
  // Honeypot: field tersembunyi lewat CSS di form, manusia tidak akan
  // pernah mengisinya. Kalau terisi, diam-diam anggap "berhasil" tanpa
  // benar-benar insert — supaya bot tidak tahu submission-nya ditolak.
  const honeypot = formData.get('website')?.toString()
  if (honeypot) {
    return { success: true }
  }

  // Verifikasi Cloudflare Turnstile — wajib, tidak ada jalur bypass.
  const turnstileToken = formData.get('turnstileToken')?.toString() ?? ''
  const isHuman = await verifyTurnstile(turnstileToken)
  if (!isHuman) {
    return { success: false, error: 'Verifikasi captcha gagal. Silakan coba lagi.' }
  }

  const title = formData.get('title')?.toString().trim() ?? ''
  const companyName = formData.get('company_name')?.toString().trim() ?? ''
  const companyLogo = formData.get('company_logo')?.toString().trim() ?? ''
  const categoryId = formData.get('category_id')?.toString() ?? ''
  const jobType = formData.get('job_type')?.toString() ?? ''
  const location = formData.get('location')?.toString().trim() || 'Remote - Indonesia'
  const salaryMin = formData.get('salary_min')?.toString() ?? ''
  const salaryMax = formData.get('salary_max')?.toString() ?? ''
  const applyUrl = formData.get('apply_url')?.toString().trim() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const requirements = formData.get('requirements')?.toString() ?? ''
  const benefits = formData.get('benefits')?.toString() ?? ''

  // Validasi server-side — atribut `required` di HTML bisa dilewati siapa
  // pun yang memanggil Server Action ini langsung, jadi tetap divalidasi
  // ulang di sini.
  if (!title || !companyName || !categoryId || !jobType || !location || !applyUrl || !description) {
    return { success: false, error: 'Ada kolom wajib yang belum terisi.' }
  }
  if (!isValidUrl(applyUrl)) {
    return { success: false, error: 'Link Form Lamaran / Email harus berupa URL yang valid.' }
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

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title,
      company_name: companyName,
      company_logo: companyLogo || null,
      category_id: categoryId || null,
      job_type: jobType,
      location,
      salary_range: formatSalaryRange(salaryMin, salaryMax),
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      apply_url: applyUrl,
      description,
      requirements: linesToArray(requirements),
      benefits: linesToArray(benefits),
      is_approved: false, // moderasi manual — lihat migration 04
      is_featured: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Gagal menyimpan loker:', error.message)
    return { success: false, error: 'Gagal menyimpan loker. Silakan coba lagi.' }
  }

  return { success: true, jobId: data.id }
}