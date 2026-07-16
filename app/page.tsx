import { createClient } from '@/utils/supabase/server'
import JobBoard from '@/components/JobBoard'
import { getExpiryCutoffISOString } from '@/lib/job-utils'
import type { Job, Category } from '@/lib/types'

// ISR: halaman di-regenerate tiap 60 detik sekali agar loker baru
// tetap muncul tanpa perlu redeploy manual.
export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: jobs, error: jobsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from('jobs')
        .select('*, categories(*)')
        .eq('is_approved', true)
        .gte('created_at', getExpiryCutoffISOString()) // sembunyikan loker > 30 hari
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])

  if (jobsError) console.error('Gagal mengambil data jobs:', jobsError.message)
  if (categoriesError) console.error('Gagal mengambil data categories:', categoriesError.message)

  return (
    <JobBoard
      initialJobs={(jobs as Job[]) ?? []}
      categories={(categories as Category[]) ?? []}
    />
  )
}