'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SITE_URL } from '@/lib/site-config'

interface AuthResult {
  success: boolean
  error?: string
}

export async function signInWithPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!email || !password) {
    return { success: false, error: 'Email dan password wajib diisi.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        success: false,
        error: 'Email belum diverifikasi. Cek inbox kamu untuk link konfirmasi dulu.',
      }
    }
    return { success: false, error: 'Email atau password salah.' }
  }

  return { success: true }
}

// Dipanggil langsung sebagai form action (<form action={signInWithGoogle}>)
// — makanya nggak balikin data, tapi langsung redirect ke halaman consent
// Google. Supabase yang nanti redirect balik ke /auth/callback setelah
// orangnya setuju di sisi Google.
export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${SITE_URL}/auth/callback` },
  })

  if (error || !data.url) {
    console.error('Gagal memulai login Google:', error?.message)
    redirect('/masuk?error=google')
  }

  redirect(data.url)
}