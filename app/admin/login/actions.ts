'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function login(formData: FormData) {
  const password = formData.get('password')?.toString() ?? ''

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1')
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  })

  redirect('/admin')
}