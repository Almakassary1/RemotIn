'use server'

import { createClient } from '@/utils/supabase/server'

export async function updatePassword(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const password = formData.get('password')?.toString() ?? ''
  const confirmPassword = formData.get('confirm_password')?.toString() ?? ''

  if (password.length < 8) {
    return { success: false, error: 'Password minimal 8 karakter.' }
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'Konfirmasi password tidak cocok.' }
  }

  // Halaman ini cuma bisa diakses lewat sesi sementara yang dibuat
  // /auth/callback dari link reset di email — updateUser otomatis pakai
  // sesi itu, nggak perlu password lama.
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('Gagal atur ulang password:', error.message)
    return {
      success: false,
      error: 'Gagal mengatur ulang password. Link mungkin sudah kedaluwarsa — coba lagi dari awal.',
    }
  }

  return { success: true }
}