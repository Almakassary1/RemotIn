import JobRow from './JobRow'
import type { Job } from '@/lib/types'

const headClass =
  'whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] first:pl-5 last:pr-5'

export default function JobsTable({
  jobs,
  paidJobIds,
}: {
  jobs: Job[]
  paidJobIds: Set<string>
}) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-line)] py-16 text-center text-sm text-[var(--color-muted)]">
        Belum ada loker yang masuk.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-line)]">
            <th className={headClass}>Judul</th>
            <th className={headClass}>Perusahaan</th>
            <th className={headClass}>Tanggal</th>
            <th className={headClass}>Approved</th>
            <th className={headClass}>Featured</th>
            <th className={headClass}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} isPaid={paidJobIds.has(job.id)} />
          ))}
        </tbody>
      </table>
    </div>
  )
}