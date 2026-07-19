'use server'

import crypto from 'crypto'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

interface SubmitJobResult {
  success: boolean
  error?: string
  jobId?: string
}

// Upload logo pakai admin client (service role) — bukan client biasa,
// karena upload ini terjadi di form publik tanpa login. Daripada buka
// storage policy INSERT ke publik (rawan disalahgunakan buat upload
// sembarang file), kita proses filenya di server SETELAH Turnstile +
// honeypot lolos, baru upload pakai service role. Pola yang sama dengan
// alasan createAdminClient() dipakai di app/newsletter/confirm/page.tsx.
const LOGO_EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}
const MAX_LOGO_BYTES = 2 * 1024 * 1024 // 2MB, samakan dengan file_size_limit bucket

async function uploadCompanyLogo(file: File): Promise<{ url: string | null; error?: string }> {
  const ext = LOGO_EXTENSION_BY_MIME[file.type]
  if (!ext) {
    return { url: null, error: 'Format logo harus PNG, JPG, WEBP, atau SVG.' }
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { url: null, error: 'Ukuran logo maksimal 2MB.' }
  }

  const admin = createAdminClient()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('company-logos')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('Gagal upload logo perusahaan:', uploadError.message)
    return { url: null, error: 'Gagal mengunggah logo. Silakan coba lagi.' }
  }

  const { data } = admin.storage.from('company-logos').getPublicUrl(path)
  return { url: data.publicUrl }
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

  // Validasi server-side — atribut `required` di HTML bisa dilewati siapa
  // pun yang memanggil Server Action ini langsung, jadi tetap divalidasi
  // ulang di sini.
  if (!title || !companyName || !categoryId || !jobType || !location || !applyUrl || !description) {
    return { success: false, error: 'Ada kolom wajib yang belum terisi.' }
  }
  if (!isValidUrl(applyUrl)) {
    return { success: false, error: 'Link Form Lamaran / Email harus berupa URL yang valid.' }
  }
  if (workArrangement !== 'Full Remote' && workArrangement !== 'Hybrid') {
    return { success: false, error: 'Susunan kerja tidak valid.' }
  }
  if (title.length > 150 || companyName.length > 150) {
    return { success: false, error: 'Judul posisi atau nama perusahaan terlalu panjang.' }
  }
  if (description.length > 5000) {
    return { success: false, error: 'Deskripsi pekerjaan terlalu panjang (maksimal 5000 karakter).' }
  }

  // Logo opsional — kalau field file-nya kosong, browser tetap kirim File
  // kosong (size 0), jadi dicek size dulu sebelum diproses jadi upload.
  let companyLogoUrl: string | null = null
  const logoFile = formData.get('company_logo')
  if (logoFile instanceof File && logoFile.size > 0) {
    const uploadResult = await uploadCompanyLogo(logoFile)
    if (uploadResult.error) {
      return { success: false, error: uploadResult.error }
    }
    companyLogoUrl = uploadResult.url
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title,
      company_name: companyName,
      company_logo: companyLogoUrl,
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