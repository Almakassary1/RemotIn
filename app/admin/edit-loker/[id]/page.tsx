import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/utils/supabase/admin'
import EditJobForm from '@/components/admin/EditJobForm'
import type { Category, Job } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Edit Loker — Admin RemotIn',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface EditJobPageProps {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }

  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: job, error: jobError }, { data: categories }] = await Promise.all([
    supabase.from('jobs').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (jobError || !job) {
    notFound()
  }

  return <EditJobForm job={job as Job} categories={(categories as Category[]) ?? []} />
}