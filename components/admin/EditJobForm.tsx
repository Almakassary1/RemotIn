'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ChevronDown, ArrowLeft } from 'lucide-react'
import { updateJob } from '@/app/admin/edit-loker/[id]/actions'
import type { Category, Job, JobType, WorkArrangement } from '@/lib/types'
import Toast from '@/components/Toast'

interface EditJobFormProps {
  job: Job
  categories: Category[]
}

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Freelance']
const WORK_ARRANGEMENTS: WorkArrangement[] = ['Full Remote', 'Hybrid']

const inputClass =
  'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15'
const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-ink)]'

function jobToFormState(job: Job) {
  return {
    title: job.title,
    company_name: job.company_name,
    company_logo: job.company_logo ?? '',
    category_id: job.category_id ?? '',
    job_type: job.job_type,
    work_arrangement: job.work_arrangement,
    location: job.location,
    salary_min: job.salary_min?.toString() ?? '',
    salary_max: job.salary_max?.toString() ?? '',
    apply_url: job.apply_url,
    description: job.description,
    requirements: (job.requirements ?? []).join('\n'),
    benefits: (job.benefits ?? []).join('\n'),
  }
}

type FormState = ReturnType<typeof jobToFormState>

export default function EditJobForm({ job, categories }: EditJobFormProps) {
  const [form, setForm] = useState<FormState>(() => jobToFormState(job))
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateJob(job.id, formData)

    if (!result.success) {
      setToast({ type: 'error', message: result.error ?? 'Gagal menyimpan perubahan.' })
      setLoading(false)
      return
    }

    setToast({ type: 'success', message: 'Perubahan berhasil disimpan.' })
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <div className="mt-4">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
            Edit Loker
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-muted)]">
            Mengedit &quot;{job.title}&quot; di {job.company_name}. Status Aktif/Nonaktif dan
            Featured diatur dari dashboard, bukan di sini.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8"
        >
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
                className={inputClass}
              />
            </div>
          </div>

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
              className={`${inputClass} resize-y`}
            />
          </div>

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
              placeholder={'Satu poin per baris'}
              className={`${inputClass} resize-y`}
            />
          </div>

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
              placeholder={'Satu poin per baris'}
              className={`${inputClass} resize-y`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </form>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </main>
  )
}