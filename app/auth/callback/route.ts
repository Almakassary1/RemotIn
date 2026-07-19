import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Route ini sekarang CUMA dipakai buat selesai login Google (redirect
// dari Google balik ke sini bawa `code` yang ditukar jadi sesi aktif).
// Konfirmasi daftar & reset password TIDAK lewat sini lagi — dua alur itu
// sekarang pakai kode 6 digit (verifyOtp), bukan link yang diklik, biar
// nggak kena masalah "email prefetching" (lihat app/daftar/actions.ts).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Gagal menukar code auth jadi sesi:', error.message)
  }

  return NextResponse.redirect(`${origin}/masuk?error=auth`)
}