import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client untuk dipakai di Server Component, Server Action, atau Route Handler.
 * Dipakai untuk fetch data langsung di server (SSR) — inilah yang kita pakai
 * di app/page.tsx untuk mengambil data jobs & categories.
 *
 * Catatan: di Next.js 14, `cookies()` bersifat sinkron.
 * Jika project kamu sudah di-upgrade ke Next.js 15+, ganti baris di bawah
 * menjadi: `const cookieStore = await cookies()`.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Bisa diabaikan jika setAll dipanggil dari Server Component.
            // Aman selama ada middleware yang me-refresh session (belum kita butuhkan di MVP ini).
          }
        },
      },
    }
  )
}
