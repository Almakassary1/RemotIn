import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Satu route ini dipakai buat 3 alur sekaligus: konfirmasi email daftar,
// selesai login Google, dan link reset password — ketiganya sama-sama
// balik ke sini bawa `code` yang ditukar jadi sesi aktif. Bedanya cuma
// tujuan redirect setelahnya, dikontrol lewat query param `next`.
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