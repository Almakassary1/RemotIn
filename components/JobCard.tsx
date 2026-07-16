import Link from 'next/link'
import { Briefcase, Wallet, ArrowRight } from 'lucide-react'
import type { Job } from '@/lib/types'

export default function JobCard({ job }: { job: Job }) {
  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    job.company_name
  )}&background=0E6E5B&color=fff`

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group relative flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(14,110,91,0.25)] sm:flex-row sm:items-center sm:gap-6"
    >
      {job.is_featured && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[11px] font-semibold text-[#3A2400] shadow-sm">
          Featured
        </span>
      )}

      {/* Logo perusahaan */}
      <img
        src={job.company_logo ?? fallbackLogo}
        alt={job.company_name}
        className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
      />

      {/* Info utama */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold text-[var(--color-ink)] sm:text-base">
          {job.title}
        </h3>
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">{job.company_name}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            </span>
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {job.job_type}
          </span>
          {job.salary_range && (
            <span className="inline-flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              {job.salary_range}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 self-start text-sm font-medium text-[var(--color-primary)] sm:self-center">
        Lihat Detail
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}