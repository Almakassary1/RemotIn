'use client'

import { Bookmark } from 'lucide-react'
import { useSavedJobs } from '@/lib/useSavedJobs'

export default function SaveJobButton({ jobId }: { jobId: string }) {
  const { isSaved, toggleSaved } = useSavedJobs()
  const saved = isSaved(jobId)

  return (
    <button
      onClick={() => toggleSaved(jobId)}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
    >
      <Bookmark className={`h-4 w-4 ${saved ? 'fill-[var(--color-primary)] text-[var(--color-primary)]' : ''}`} />
      {saved ? 'Tersimpan' : 'Simpan Loker'}
    </button>
  )
}