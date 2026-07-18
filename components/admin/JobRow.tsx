'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Star, CheckCircle2, XCircle, Trash2, Loader2, Pencil, BadgeCheck } from 'lucide-react'
import { toggleApproved, toggleFeatured, toggleVerified, deleteJob } from '@/app/admin/actions'
import { isJobExpired } from '@/lib/job-utils'
import type { Job } from '@/lib/types'

const cellClass = 'whitespace-nowrap px-4 py-3.5 first:pl-5 last:pr-5'

export default function JobRow({ job, isPaid }: { job: Job; isPaid: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)

  const postedDate = new Date(job.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const expired = isJobExpired(job.created_at)

  function handleToggleApproved() {
    startTransition(async () => {
      try {
        await toggleApproved(job.id, !job.is_approved)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Gagal mengubah status approve.')
      }
    })
  }

  function handleToggleFeatured() {
    startTransition(async () => {
      try {
        await toggleFeatured(job.id, !job.is_featured)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Gagal mengubah status featured.')
      }
    })
  }

  function handleToggleVerified() {
    startTransition(async () => {
      try {
        await toggleVerified(job.id, !job.company_verified)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Gagal mengubah status verifikasi.')
      }
    })
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `Hapus loker "${job.title}" di ${job.company_name}? Tindakan ini tidak bisa dibatalkan.`
    )
    if (!confirmed) return

    startTransition(async () => {
      try {
        await deleteJob(job.id)
        setDeleted(true)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Gagal menghapus loker.')
      }
    })
  }

  if (deleted) return null

  return (
    <tr
      className={`border-b border-[var(--color-line)] text-sm transition-opacity last:border-0 ${
        isPending ? 'opacity-50' : ''
      }`}
    >
      <td className={`${cellClass} font-medium text-[var(--color-ink)]`}>{job.title}</td>
      <td className={`${cellClass} text-[var(--color-muted)]`}>{job.company_name}</td>
      <td className={`${cellClass} text-[var(--color-muted)]`}>
        <div className="flex items-center gap-2">
          {postedDate}
          {expired && (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              Expired
            </span>
          )}
        </div>
      </td>
      <td className={cellClass}>
        <button
          onClick={handleToggleApproved}
          disabled={isPending}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed ${
            job.is_approved
              ? 'bg-emerald-50 text-[var(--color-primary)]'
              : 'bg-[var(--color-bg)] text-[var(--color-muted)]'
          }`}
        >
          {job.is_approved ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {job.is_approved ? 'Aktif' : 'Nonaktif'}
        </button>
      </td>
      <td className={cellClass}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleFeatured}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed ${
              job.is_featured ? 'bg-amber-50 text-amber-700' : 'bg-[var(--color-bg)] text-[var(--color-muted)]'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${job.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
            {job.is_featured ? 'Featured' : 'Standar'}
          </button>
          <button
            onClick={handleToggleVerified}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed ${
              job.company_verified
                ? 'bg-emerald-50 text-[var(--color-primary)]'
                : 'bg-[var(--color-bg)] text-[var(--color-muted)]'
            }`}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            {job.company_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
          </button>
          {isPaid && (
            <span
              title="Sudah dibayar via Midtrans — kalau ditolak, ingat refund manual"
              className="text-xs"
            >
              💰
            </span>
          )}
        </div>
      </td>
      <td className={cellClass}>
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/edit-loker/${job.id}`}
            aria-label={`Edit loker ${job.title}`}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            aria-label={`Hapus loker ${job.title}`}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Hapus
          </button>
        </div>
      </td>
    </tr>
  )
}