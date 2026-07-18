'use server'

import crypto from 'crypto'
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

  // Token dibuat DI SINI (bukan dibaca balik dari database) supaya insert-nya
  // tetap murni INSERT-only, sesuai RLS newsletter_subscribers yang sengaja
  // tidak izinkan SELECT publik. Kalau kita coba .select() hasil insert-nya,
  // itu bakal ditolak RLS meskipun insert-nya sendiri berhasil.
  const token = crypto.randomUUID()

  const supabase = await createClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, confirmation_token: token })

  if (error) {
    // Kode 23505 = unique constraint violation, artinya email ini sudah
    // pernah subscribe. Anggap saja sukses dari sisi UX — pengunjung nggak
    // perlu tahu detail itu. Sengaja TIDAK kirim ulang email konfirmasi di
    // sini, supaya form ini nggak bisa disalahgunakan buat nge-spam inbox
    // orang lain cuma dengan submit email yang sama berkali-kali.
    if (error.code === '23505') {
      return { success: true }
    }
    console.error('Gagal menyimpan subscriber newsletter:', error.message)
    return { success: false, error: 'Gagal mendaftar. Silakan coba lagi.' }
  }

  try {
    await sendConfirmationEmail(email, token)
  } catch (err) {
    // Subscriber sudah tersimpan di DB walau email gagal terkirim — jangan
    // gagalkan seluruh proses cuma karena ini, cukup log biar bisa dicek.
    console.error('Gagal mengirim email konfirmasi newsletter:', err)
  }

  return { success: true }
}