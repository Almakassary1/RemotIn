'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ChevronDown, CheckCircle2 } from 'lucide-react'
import { submitJob } from '@/app/post-job/actions'
import type { Category, JobType, WorkArrangement } from '@/lib/types'
import Toast from './Toast'
import TurnstileWidget from './TurnstileWidget'
import FeaturedUpsell from './FeaturedUpsell'

interface PostJobFormProps {
  categories: Category[]
}

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Freelance']
const WORK_ARRANGEMENTS: WorkArrangement[] = ['Full Remote', 'Hybrid']

const initialForm = {
  title: '',
  company_name: '',
  company_logo: '',
  category_id: '',
  job_type: 'Full-time' as JobType,
  work_arrangement: 'Full Remote' as WorkArrangement,
  location: 'Remote - Indonesia',
  salary_min: '',
  salary_max: '',
  apply_url: '',
  description: '',
  requirements: '',
  benefits: '',
}

type FormState = typeof initialForm

const inputClass =
  'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15'
const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-ink)]'

export default function PostJobForm({ categories }: PostJobFormProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [newJobId, setNewJobId] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!turnstileToken) {
      setToast({ type: 'error', message: 'Mohon selesaikan verifikasi captcha terlebih dahulu.' })
      return
    }

    setLoading(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    formData.set('turnstileToken', turnstileToken)

    const result = await submitJob(formData)

    if (!result.success) {
      setToast({ type: 'error', message: result.error ?? 'Gagal memasang loker. Silakan coba lagi.' })
      setLoading(false)
      return
    }

    setSubmitted(true)
    setNewJobId(result.jobId ?? null)
    setLoading(false)
  }

  function handlePostAnother() {
    setForm(initialForm)
    setTurnstileToken(null)
    setSubmitted(false)
    setNewJobId(null)
  }

  // ===== Halaman sukses (menggantikan form, tanpa auto-redirect) =====
  if (submitted) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-[var(--color-primary)]" />
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
            Loker Berhasil Dikirim!
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
            Lowongan Anda berhasil dikirim dan sedang dalam proses peninjauan oleh tim admin
            RemotIn. Loker akan otomatis tayang di RemotIn setelah disetujui.
          </p>

          {newJobId && <FeaturedUpsell jobId={newJobId} />}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347]"
            >
              Kembali ke Beranda
            </Link>
            <button
              onClick={handlePostAnother}
              className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-primary)]"
            >
              Pasang Loker Lain
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
            Gratis selama masa MVP
          </span>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)] sm:text-4xl">
            Pasang Loker Remote Kamu
          </h1>
          <p className="mt-3 text-[15px] text-[var(--color-muted)]">
            Jangkau talenta remote terbaik Indonesia. Setiap loker ditinjau singkat oleh tim kami
            sebelum tayang untuk menjaga kualitas listing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8"
        >
          {/* Honeypot — JANGAN dihapus. Disembunyikan dari manusia lewat
              CSS; bot yang asal isi semua field akan mengisi ini. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden"
          />

          {/* Posisi & Perusahaan */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="title">
                Judul Posisi *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={150}
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="mis. Backend Developer"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="company_name">
                Nama Perusahaan *
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                required
                maxLength={150}
                value={form.company_name}
                onChange={(e) => update('company_name', e.target.value)}
                placeholder="mis. PT Teknologi Maju"
                className={inputClass}
              />
            </div>
          </div>

          {/* Logo & Lokasi */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="company_logo">
                URL Logo Perusahaan
              </label>
              <input
                id="company_logo"
                name="company_logo"
                type="url"
                value={form.company_logo}
                onChange={(e) => update('company_logo', e.target.value)}
                placeholder="https://... (opsional)"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="location">
                Lokasi *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className={labelClass} htmlFor="category_id">
              Kategori Pekerjaan *
            </label>
            <div className="relative">
              <select
                id="category_id"
                name="category_id"
                required
                value={form.category_id}
                onChange={(e) => update('category_id', e.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="" disabled>
                  Pilih kategori...
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            </div>
          </div>

          {/* Tipe Pekerjaan */}
          <div>
            <span className={labelClass}>Tipe Pekerjaan *</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipe Pekerjaan">
              {JOB_TYPES.map((type) => (
                <label key={type} className="cursor-pointer">
                  <input
                    type="radio"
                    name="job_type"
                    value={type}
                    checked={form.job_type === type}
                    onChange={() => update('job_type', type)}
                    className="peer sr-only"
                  />
                  <span className="block rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-2">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Susunan Kerja */}
          <div>
            <span className={labelClass}>Susunan Kerja *</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Susunan Kerja">
              {WORK_ARRANGEMENTS.map((arrangement) => (
                <label key={arrangement} className="cursor-pointer">
                  <input
                    type="radio"
                    name="work_arrangement"
                    value={arrangement}
                    checked={form.work_arrangement === arrangement}
                    onChange={() => update('work_arrangement', arrangement)}
                    className="peer sr-only"
                  />
                  <span className="block rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-2">
                    {arrangement}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Gaji */}
          <div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="salary_min">
                  Gaji Minimal (Rp)
                </label>
                <input
                  id="salary_min"
                  name="salary_min"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.salary_min}
                  onChange={(e) => update('salary_min', e.target.value)}
                  placeholder="mis. 8000000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="salary_max">
                  Gaji Maksimal (Rp)
                </label>
                <input
                  id="salary_max"
                  name="salary_max"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.salary_max}
                  onChange={(e) => update('salary_max', e.target.value)}
                  placeholder="mis. 12000000"
                  className={inputClass}
                />
              </div>
            </div>
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              Opsional — kosongkan jika tidak ingin mencantumkan kisaran gaji.
            </p>
          </div>

          {/* Apply URL */}
          <div>
            <label className={labelClass} htmlFor="apply_url">
              Link Form Lamaran / Email *
            </label>
            <input
              id="apply_url"
              name="apply_url"
              type="url"
              required
              value={form.apply_url}
              onChange={(e) => update('apply_url', e.target.value)}
              placeholder="https://... atau mailto:hr@perusahaan.com"
              className={inputClass}
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className={labelClass} htmlFor="description">
              Deskripsi Pekerjaan *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              maxLength={5000}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Jelaskan tanggung jawab dan konteks pekerjaan ini..."
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Requirements */}
          <div>
            <label className={labelClass} htmlFor="requirements">
              Persyaratan / Kualifikasi
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={4}
              maxLength={3000}
              value={form.requirements}
              onChange={(e) => update('requirements', e.target.value)}
              placeholder={'Satu poin per baris, mis:\nMinimal 2 tahun pengalaman\nMahir Bahasa Inggris'}
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Benefits */}
          <div>
            <label className={labelClass} htmlFor="benefits">
              Benefit / Fasilitas
            </label>
            <textarea
              id="benefits"
              name="benefits"
              rows={4}
              maxLength={3000}
              value={form.benefits}
              onChange={(e) => update('benefits', e.target.value)}
              placeholder={'Satu poin per baris, mis:\nAsuransi kesehatan\nJam kerja fleksibel'}
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Anti-spam */}
          <div>
            <span className={labelClass}>Verifikasi *</span>
            <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
          </div>

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Pasang Loker Sekarang'
            )}
          </button>
        </form>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </main>
  )
}