'use server'

import { createClient } from '@/utils/supabase/server'

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

  // Sengaja TANPA emailRedirectTo — kita pakai alur kode 6 digit
  // (verifyOtp), bukan link yang diklik. Ini menghindari masalah "email
  // prefetching": sistem scan keamanan email (terutama Gmail) suka
  // otomatis "buka" link di email buat cek keamanan, yang bikin link
  // ke-pakai duluan sebelum orangnya sendiri sempat klik — hasilnya link
  // dianggap kedaluwarsa padahal baru dikirim beberapa detik. Kode manual
  // nggak kena masalah itu karena cuma valid kalau diketik sengaja oleh
  // orangnya. Lihat Bagian 10 dokumentasi buat detail kejadian aslinya.
  const { error } = await supabase.auth.signUp({ email, password })

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

export async function verifySignupOtp(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const token = formData.get('token')?.toString().trim() ?? ''

  if (!/^\d{6}$/.test(token)) {
    return { success: false, error: 'Kode harus 6 digit angka.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })

  if (error) {
    console.error('Gagal verifikasi kode daftar:', error.message)
    return { success: false, error: 'Kode salah atau sudah kedaluwarsa. Coba kirim ulang.' }
  }

  return { success: true }
}

export async function resendSignupOtp(email: string): Promise<AuthResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })

  if (error) {
    console.error('Gagal kirim ulang kode daftar:', error.message)
    return { success: false, error: 'Gagal kirim ulang. Coba lagi sebentar lagi.' }
  }

  return { success: true }
}