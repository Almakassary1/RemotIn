'use server'

import { createClient } from '@/utils/supabase/server'
import { sendConfirmationEmail } from '@/lib/resend'

interface SubscribeResult {
  success: boolean
  error?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function subscribeNewsletter(formData: FormData): Promise<SubscribeResult> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''

  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Masukkan alamat email yang valid.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })
    .select('confirmation_token')
    .single()

  if (error) {
    // Kode 23505 = unique constraint violation, artinya email ini sudah
    // pernah subscribe. Anggap saja sukses dari sisi UX. Sengaja TIDAK
    // kirim ulang email konfirmasi di sini, supaya form ini nggak bisa
    // disalahgunakan buat nge-spam inbox orang lain.
    if (error.code === '23505') {
      return { success: true }
    }
    console.error('Gagal menyimpan subscriber newsletter:', error.message)
    return { success: false, error: 'Gagal mendaftar. Silakan coba lagi.' }
  }

  try {
    await sendConfirmationEmail(email, data.confirmation_token)
  } catch (err) {
    // Subscriber sudah tersimpan di DB walau email gagal terkirim — jangan
    // gagalkan seluruh proses cuma karena ini, cukup log biar bisa dicek.
    console.error('Gagal mengirim email konfirmasi newsletter:', err)
  }

  return { success: true }
}