import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/utils/supabase/admin'
import { isJobExpired } from '@/lib/job-utils'
import { logout } from './actions'
import StatCard from '@/components/admin/StatCard'
import JobsTable from '@/components/admin/JobsTable'
import type { Job } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Admin — RemotIn',
  robots: { index: false, follow: false },
}

// Halaman ini selalu dinamis (tidak di-cache) karena kontennya sensitif
// dan bergantung pada cookie sesi admin per-request.
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }

  // Pakai admin client (service role) supaya admin bisa lihat SEMUA loker,
  // termasuk yang is_approved = false — bukan cuma yang publik seperti di
  // app/page.tsx. Diurutkan: yang menunggu review (is_approved = false)
  // muncul duluan, supaya admin langsung lihat yang perlu ditindaklanjuti.
  const supabase = createAdminClient()
  const [{ data: jobs, error }, { data: payments }] = await Promise.all([
    supabase
      .from('jobs')
      .select('*, categories(*)')
      .order('is_approved', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase.from('payments').select('job_id').eq('status', 'settlement'),
  ])

  if (error) {
    console.error('Gagal mengambil data jobs (admin):', error.message)
  }

  // Set job_id yang sudah dibayar Featured — dipakai JobRow untuk kasih
  // indikator "💰 Dibayar", supaya kalau loker ini ditolak, admin tahu
  // harus refund manual ke recruiter-nya.
  const paidJobIds = new Set((payments ?? []).map((p) => p.job_id).filter(Boolean))

  const allJobs = (jobs as Job[]) ?? []
  const stats = {
    total: allJobs.length,
    pending: allJobs.filter((j) => !j.is_approved).length,
    featured: allJobs.filter((j) => j.is_featured).length,
    // "Aktif" = benar-benar tayang ke publik: harus approved DAN belum expired
    active: allJobs.filter((j) => j.is_approved && !isJobExpired(j.created_at)).length,
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
              Dashboard Moderasi
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Kelola seluruh lowongan kerja yang masuk ke RemotIn.
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="self-start rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Keluar
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Loker" value={stats.total} accent="ink" />
          <StatCard label="Menunggu Review" value={stats.pending} accent="accent" />
          <StatCard label="Loker Featured" value={stats.featured} accent="accent" />
          <StatCard label="Loker Aktif" value={stats.active} accent="primary" />
        </div>

        <div className="mt-8">
          <JobsTable jobs={allJobs} paidJobIds={paidJobIds} />
        </div>
      </div>
    </main>
  )
}