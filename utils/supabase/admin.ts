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
 * Hanya dipakai di app/admin/** (Server Component & Server Action) yang
 * sudah dilindungi requireAdmin() dari lib/admin-auth.ts.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}