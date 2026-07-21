'use server'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, createSessionCookieValue } from '@/lib/admin-auth'

function timingSafeEqualStr(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  return aBuf.length === bBuf.length && crypto.timingSafeEqual(aBuf, bBuf)
}

export async function login(formData: FormData) {
  const password = formData.get('password')?.toString() ?? ''
  const correct = process.env.ADMIN_PASSWORD ?? ''

  if (!correct || !timingSafeEqualStr(password, correct)) {
    redirect('/admin/login?error=1')
  }

  ;(await cookies()).set(ADMIN_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/admin')
}