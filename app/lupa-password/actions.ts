'use server'

import { createClient } from '@/utils/supabase/server'

interface AuthResult {
  success: boolean
  error?: string
}

export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  if (!email) {
    return { success: false, error: 'Masukkan alamat email.' }
  }

  const supabase = await createClient()
  // Tanpa redirectTo — alur ini pakai kode 6 digit (verifyOtp), bukan
  // link yang diklik. Alasan sama seperti di app/daftar/actions.ts:
  // menghindari "email prefetching" yang bikin link ke-pakai duluan oleh
  // sistem scan keamanan email sebelum orangnya sendiri sempat klik.
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    console.error('Gagal mengirim kode reset password:', error.message)
  }

  // Selalu balas sukses walau error/email nggak terdaftar — supaya
  // endpoint ini nggak bisa dipakai buat cek email mana yang punya akun
  // RemotIn.
  return { success: true }
}

export async function resetPasswordWithOtp(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const token = formData.get('token')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const confirmPassword = formData.get('confirm_password')?.toString() ?? ''

  if (!/^\d{6}$/.test(token)) {
    return { success: false, error: 'Kode harus 6 digit angka.' }
  }
  if (password.length < 8) {
    return { success: false, error: 'Password minimal 8 karakter.' }
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'Konfirmasi password tidak cocok.' }
  }

  const supabase = await createClient()

  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
  if (verifyError) {
    console.error('Gagal verifikasi kode reset:', verifyError.message)
    return { success: false, error: 'Kode salah atau sudah kedaluwarsa. Coba kirim ulang.' }
  }

  // verifyOtp di atas otomatis bikin sesi sementara untuk user ini —
  // updateUser di bawah pakai sesi itu (client instance yang sama),
  // nggak butuh password lama.
  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    console.error('Gagal atur ulang password:', updateError.message)
    return { success: false, error: 'Gagal mengatur ulang password. Silakan coba lagi.' }
  }

  return { success: true }
}

export async function resendResetOtp(email: string): Promise<AuthResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    console.error('Gagal kirim ulang kode reset:', error.message)
    return { success: false, error: 'Gagal kirim ulang. Coba lagi sebentar lagi.' }
  }

  return { success: true }
}