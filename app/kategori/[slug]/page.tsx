import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { getExpiryCutoffISOString } from '@/lib/job-utils'
import JobBoard from '@/components/JobBoard'
import type { Job, Category } from '@/lib/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

// ISR: halaman kategori di-regenerate tiap 60 detik
export const revalidate = 60

async function getCategory(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).single()
  return data as Category | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'Kategori Tidak Ditemukan — RemotIn' }
  }

  const title = `Loker Remote ${category.name} Indonesia`
  const description = `Kumpulan lowongan kerja remote & WFH kategori ${category.name} untuk talenta Indonesia, diperbarui setiap hari di RemotIn.`

  return {
    title: `${title} — RemotIn`,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary', title, description },
  }
}

// Pre-render halaman untuk tiap kategori yang ada saat build, supaya cepat
// dan langsung bisa di-index. Kategori baru (kalau ditambah lewat Supabase)
// tetap otomatis terbentuk on-demand berkat revalidate di atas.
//
// Catatan: generateStaticParams jalan di BUILD TIME, sebelum ada HTTP
// request sama sekali — jadi tidak bisa pakai createClient() dari
// utils/supabase/server.ts (yang baca cookies()). Di sini kita pakai
// client polos tanpa cookies, karena datanya (daftar kategori) memang
// publik dan tidak butuh sesi user.
export async function generateStaticParams() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: categories } = await supabase.from('categories').select('slug')
  return (categories ?? []).map((cat) => ({ slug: cat.slug }))
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const [category, { data: jobs }, { data: categories }] = await Promise.all([
    getCategory(slug),
    supabase
      .from('jobs')
      .select('*, categories(*)')
      .eq('is_approved', true)
      .gte('created_at', getExpiryCutoffISOString())
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!category) {
    notFound()
  }

  return (
    <JobBoard
      initialJobs={(jobs as Job[]) ?? []}
      categories={(categories as Category[]) ?? []}
      initialCategorySlug={category.slug}
      heroTitle={`Loker Remote ${category.name} Indonesia`}
      heroSubtitle={`Kumpulan lowongan kerja remote & WFH kategori ${category.name} yang dikurasi khusus untuk talenta Indonesia.`}
    />
  )
}