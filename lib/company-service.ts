import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

interface UpsertCompanyInput {
  name: string
  logoUrl?: string | null
}

// Dipanggil dari server action mana pun yang butuh menyambungkan sebuah
// loker ke tabel `companies` — dipakai bareng oleh app/post-job/actions.ts
// (submission publik), app/admin/tambah-loker/actions.ts, dan
// app/admin/edit-loker/[id]/actions.ts, biar logikanya nggak ditulis 3x.
//
// SELALU dipanggil dengan `admin` (service role client dari
// utils/supabase/admin.ts), BUKAN client anon/biasa — tabel `companies`
// sengaja tidak punya policy insert/update untuk publik (lihat migrasi
// add_companies_table), semua mutasi lewat jalur ini saja, setelah
// validasi di server action pemanggilnya sudah lolos.
//
// Balikin null (bukan lempar error) kalau gagal — company_id di tabel
// jobs nullable, jadi kalaupun ini gagal, penyimpanan loker itu sendiri
// tetap boleh lanjut (nggak nge-block user cuma gara-gara langkah
// tambahan ini, yang memang bukan bagian paling kritis dari alur).
export async function upsertCompany(
  admin: SupabaseClient,
  { name, logoUrl }: UpsertCompanyInput
): Promise<string | null> {
  const trimmedName = name.trim()
  if (!trimmedName) return null

  // Cari dulu, case-insensitive — kemungkinan besar perusahaan ini sudah
  // pernah posting loker lain sebelumnya.
  const { data: existing, error: findError } = await admin
    .from('companies')
    .select('id, logo_url')
    .ilike('name', trimmedName)
    .limit(1)
    .maybeSingle()

  if (findError) {
    console.error('Gagal mencari data companies:', findError.message)
    return null
  }

  if (existing) {
    // Lengkapi logo kalau baru dikirim dan yang lama belum punya —
    // TAPI jangan timpa logo yang sudah ada, supaya submission loker
    // susulan yang kebetulan lupa upload logo nggak menghapus logo
    // yang sudah pernah di-set sebelumnya.
    if (logoUrl && !existing.logo_url) {
      const { error: updateError } = await admin
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('id', existing.id)
      if (updateError) {
        console.error('Gagal melengkapi logo companies:', updateError.message)
      }
    }
    return existing.id
  }

  const slug = await generateUniqueSlug(admin, trimmedName)
  const { data: created, error: insertError } = await admin
    .from('companies')
    .insert({ name: trimmedName, slug, logo_url: logoUrl ?? null })
    .select('id')
    .single()

  if (insertError) {
    console.error('Gagal membuat data companies baru:', insertError.message)
    return null
  }

  return created.id
}

async function generateUniqueSlug(admin: SupabaseClient, name: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // buang tanda diakritik, misal: é -> e
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'perusahaan'

  let candidate = base
  let suffix = 2

  // Coba sampai 20x nambahin -2, -3, dst kalau slug-nya kepakai. Kasus
  // ini jarang terjadi (2 nama beda yang kebetulan hasil slug-nya sama
  // setelah karakter aneh dibuang), tapi tetap dijaga jangan sampai gagal.
  for (let i = 0; i < 20; i++) {
    const { data } = await admin.from('companies').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    candidate = `${base}-${suffix}`
    suffix++
  }

  // Fallback super jarang kepakai — random suffix biar nggak infinite loop.
  return `${base}-${crypto.randomUUID().slice(0, 6)}`
}