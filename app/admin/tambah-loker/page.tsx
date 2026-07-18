import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/utils/supabase/admin'
import AddJobForm from '@/components/admin/AddJobForm'
import type { Category } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Tambah Loker — Admin RemotIn',
  robots: { index: false, follow: false },
}

// Sama seperti app/admin/page.tsx — halaman ini bergantung pada cookie
// sesi admin per-request, jadi tidak boleh di-cache.
export const dynamic = 'force-dynamic'

export default async function AddJobPage() {
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }

  // Pakai admin client (bukan utils/supabase/server.ts) supaya konsisten
  // dengan pola di app/admin/page.tsx dan tidak bergantung pada RLS publik.
  const supabase = createAdminClient()
  const { data: categories, error } = await supabase.from('categories').select('*').order('name')

  if (error) {
    console.error('Gagal mengambil data categories (admin):', error.message)
  }

  return <AddJobForm categories={(categories as Category[]) ?? []} />
}