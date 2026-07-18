import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getExpiryCutoffISOString } from '@/lib/job-utils'
import SavedJobsList from '@/components/SavedJobsList'
import type { Job } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Loker Tersimpan — RemotIn',
  robots: { index: false, follow: false },
}

// ISR sama seperti homepage — halaman ini nggak personal di sisi server
// (semua loker aktif di-fetch sama untuk semua orang), personalisasinya
// terjadi di client lewat localStorage (lihat SavedJobsList.tsx).
export const revalidate = 60

export default async function SavedJobsPage() {
  const supabase = await createClient()
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*, categories(*)')
    .eq('is_approved', true)
    .gte('created_at', getExpiryCutoffISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gagal mengambil data jobs (tersimpan):', error.message)
  }

  return <SavedJobsList allJobs={(jobs as Job[]) ?? []} />
}