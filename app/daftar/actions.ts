'use server'

import { createClient } from '@/utils/supabase/server'
import { SITE_URL } from '@/lib/site-config'

interface AuthResult {
  success: boolean
  error?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function signUpWithPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const confirmPassword = formData.get('confirm_password')?.toString() ?? ''

  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Masukkan alamat email yang valid.' }
  }
  if (password.length < 8) {
    return { success: false, error: 'Password minimal 8 karakter.' }
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'Konfirmasi password tidak cocok.' }
  }

  const supabase = await createClient()

  // emailRedirectTo wajib ada — tanpa ini Supabase pakai Site URL default
  // dari dashboard yang mungkin belum di-set ke domain custom. Verifikasi
  // WAJIB (di-set di dashboard Supabase, bukan di kode) — konsisten sama
  // pola double opt-in newsletter.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('user already')) {
      return {
        success: false,
        error: 'Email ini sudah terdaftar. Coba masuk, atau reset password kalau lupa.',
      }
    }
    console.error('Gagal mendaftar:', error.message)
    return { success: false, error: 'Gagal mendaftar. Silakan coba lagi.' }
  }

  return { success: true }
}