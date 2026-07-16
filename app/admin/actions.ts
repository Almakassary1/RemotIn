'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function toggleApproved(jobId: string, nextValue: boolean) {
  await requireAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from('jobs').update({ is_approved: nextValue }).eq('id', jobId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/jobs/[id]', 'page')
}

export async function toggleFeatured(jobId: string, nextValue: boolean) {
  await requireAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from('jobs').update({ is_featured: nextValue }).eq('id', jobId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/jobs/[id]', 'page')
}

export async function deleteJob(jobId: string) {
  await requireAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from('jobs').delete().eq('id', jobId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  redirect('/admin/login')
}