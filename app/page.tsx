import { createClient } from '@/utils/supabase/server'
import JobBoard from '@/components/JobBoard'
import {
  parseJobFilters,
  fetchFilteredJobs,
  fetchFilteredJobsCount,
  fetchTopJob,
  fetchTotalActiveJobsCount,
  fetchTotalCompaniesCount,
  buildLoadMoreHref,
} from '@/lib/job-query'
import type { Category } from '@/lib/types'

// Catatan: revalidate=60 di sini secara teknis nggak berlaku penuh
// selama cookies() masih dipanggil di RootLayout (lihat app/layout.tsx)
// yang bikin seluruh situs "dynamic". Dibiarkan tetap di sini sebagai
// dokumentasi niat awal — bukan bagian dari perbaikan Fix #6 ini.
export const revalidate = 60

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const rawSearchParams = await searchParams
  const filters = parseJobFilters(rawSearchParams)

  const supabase = await createClient()

  const [
    { jobs, hasMore },
    resultCount,
    totalActiveJobs,
    totalCompanies,
    topJob,
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    fetchFilteredJobs(supabase, filters),
    fetchFilteredJobsCount(supabase, filters),
    fetchTotalActiveJobsCount(supabase),
    fetchTotalCompaniesCount(supabase),
    fetchTopJob(supabase),
    supabase.from('categories').select('*').order('name'),
  ])

  if (categoriesError) console.error('Gagal mengambil data categories:', categoriesError.message)

  const loadMoreHref = buildLoadMoreHref('/', rawSearchParams, filters.jumlah)

  return (
    <JobBoard
      jobs={jobs}
      hasMore={hasMore}
      loadMoreHref={loadMoreHref}
      resultCount={resultCount}
      totalActiveJobs={totalActiveJobs}
      totalCompanies={totalCompanies}
      topJob={topJob}
      categories={(categories as Category[]) ?? []}
    />
  )
}