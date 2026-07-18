import { createClient } from '@supabase/supabase-js'

/**
 * PERINGATAN — SERVER-ONLY.
 * Client ini pakai Service Role Key yang BYPASS semua RLS policy: akses
 * penuh baca/tulis/hapus ke seluruh tabel tanpa terkecuali.
 *
 * JANGAN PERNAH:
 * - Import file ini di komponen 'use client'
 * - Mengirim/menampilkan service_role key ke browser
 * - Memberi nama env var-nya dengan prefix NEXT_PUBLIC_ (itu akan
 *   membuatnya ikut ter-bundle ke JavaScript sisi client)
 *
* Dipakai di app/admin/** (Server Component & Server Action) yang sudah
 * dilindungi requireAdmin() dari lib/admin-auth.ts.
 *
 * PENGECUALIAN YANG SAH: app/newsletter/confirm/page.tsx juga pakai ini,
 * di luar app/admin/**. Itu BUKAN celah — akses di situ dibatasi oleh
 * kepemilikan token UUID acak yang cuma dikirim lewat email (pola sama
 * dengan link reset password), bukan oleh login admin. Dipakai karena RLS
 * newsletter_subscribers sengaja tidak izinkan SELECT/UPDATE publik.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}