import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getExpiryCutoffISOString } from '@/lib/job-utils'
import { SITE_URL } from '@/lib/site-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: jobs }, { data: categories }, { data: companies }] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, created_at, company_id')
      .eq('is_approved', true)
      .gte('created_at', getExpiryCutoffISOString()),
    supabase.from('categories').select('slug'),
    supabase.from('companies').select('id, slug'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/post-job`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.4 },
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

  // Cuma perusahaan yang punya minimal 1 loker aktif yang masuk sitemap
  // (halaman profilnya sendiri 404 kalau nggak ada loker aktif sama
  // sekali — lihat app/perusahaan/[slug]/page.tsx).
  const companyIdsWithActiveJobs = new Set((jobs ?? []).map((job) => job.company_id).filter(Boolean))
  const companyRoutes: MetadataRoute.Sitemap = (companies ?? [])
    .filter((company) => companyIdsWithActiveJobs.has(company.id))
    .map((company) => ({
      url: `${SITE_URL}/perusahaan/${company.slug}`,
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

  return [...staticRoutes, ...categoryRoutes, ...jobRoutes, ...companyRoutes]
}