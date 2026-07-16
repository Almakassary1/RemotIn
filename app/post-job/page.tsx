import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import PostJobForm from '@/components/PostJobForm'
import type { Category } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Pasang Loker — RemotIn',
  description: 'Pasang lowongan kerja remote di RemotIn dan jangkau talenta terbaik Indonesia.',
}

export default async function PostJobPage() {
  const supabase = await createClient()
  const { data: categories, error } = await supabase.from('categories').select('*').order('name')

  if (error) console.error('Gagal mengambil data categories:', error.message)

  return <PostJobForm categories={(categories as Category[]) ?? []} />
}
