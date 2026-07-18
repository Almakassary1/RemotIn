import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getExpiryCutoffISOString } from '@/lib/job-utils'
import { SITE_URL } from '@/lib/site-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: jobs }, { data: categories }] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, created_at, company_name')
      .eq('is_approved', true)
      .gte('created_at', getExpiryCutoffISOString()),
    supabase.from('categories').select('slug'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/post-job`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/tentang`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/kontak`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privasi`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${SITE_URL}/syarat-ketentuan`, changeFrequency: 'yearly', priority: 0.1 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${SITE_URL}/kategori/${cat.slug}`,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  const jobRoutes: MetadataRoute.Sitemap = (jobs ?? []).map((job) => ({
    url: `${SITE_URL}/jobs/${job.id}`,
    lastModified: new Date(job.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Satu route per nama perusahaan unik — dedupe pakai Set karena satu
  // perusahaan bisa punya banyak baris loker. Sama seperti halaman
  // detail loker, mengikuti pola nama perusahaan yang di-encode di URL
  // (lihat app/jobs/[id]/page.tsx dan components/JobCard.tsx).
  const uniqueCompanyNames = [...new Set((jobs ?? []).map((job) => job.company_name))]
  const companyRoutes: MetadataRoute.Sitemap = uniqueCompanyNames.map((name) => ({
    url: `${SITE_URL}/perusahaan/${encodeURIComponent(name)}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...categoryRoutes, ...jobRoutes, ...companyRoutes]
}