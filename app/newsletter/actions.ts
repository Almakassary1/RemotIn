'use server'

import { createClient } from '@/utils/supabase/server'

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
  const { error } = await supabase.from('newsletter_subscribers').insert({ email })

  if (error) {
    // Kode 23505 = unique constraint violation, artinya email ini sudah
    // pernah subscribe. Anggap saja sukses dari sisi UX — pengunjung nggak
    // perlu tahu detail itu, cukup dianggap "sudah terdaftar".
    if (error.code === '23505') {
      return { success: true }
    }
    console.error('Gagal menyimpan subscriber newsletter:', error.message)
    return { success: false, error: 'Gagal mendaftar. Silakan coba lagi.' }
  }

  return { success: true }
}