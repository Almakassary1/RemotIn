'use server'

import { createClient } from '@/utils/supabase/server'
import { SITE_URL } from '@/lib/site-config'

export async function requestPasswordReset(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  if (!email) {
    return { success: false, error: 'Masukkan alamat email.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/atur-ulang-password`,
  })

  if (error) {
    console.error('Gagal mengirim email reset password:', error.message)
  }

  // Selalu balas sukses walau error/email nggak terdaftar — supaya endpoint
  // ini nggak bisa dipakai buat cek email mana yang punya akun RemotIn.
  return { success: true }
}