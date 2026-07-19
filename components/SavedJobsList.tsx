'use client'

import Link from 'next/link'
import { Bookmark, ArrowLeft } from 'lucide-react'
import { useSavedJobs } from '@/lib/useSavedJobs'
import JobCard from './JobCard'
import type { Job } from '@/lib/types'

export default function SavedJobsList({ allJobs }: { allJobs: Job[] }) {
  const { savedIds, loggedIn } = useSavedJobs()
  const savedJobs = allJobs.filter((job) => savedIds.includes(job.id))

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Loker
        </Link>

        <div className="mt-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-[var(--color-primary)]" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
            Loker Tersimpan
          </h1>
        </div>
        <p className="mt-1.5 text-sm text-[var(--color-muted)]">
          {loggedIn ? (
            'Tersimpan di akun kamu — sinkron di semua device.'
          ) : (
            <>
              Tersimpan di browser ini saja.{' '}
              <Link href="/masuk" className="font-medium text-[var(--color-primary)] hover:underline">
                Masuk
              </Link>{' '}
              biar sinkron ke semua device.
            </>
          )}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {savedJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-line)] py-16 text-center text-sm text-[var(--color-muted)]">
              Belum ada loker yang disimpan. Klik ikon bookmark di kartu loker buat menyimpannya
              di sini.
            </div>
          ) : (
            savedJobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </main>
  )
}