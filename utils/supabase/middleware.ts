import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Refresh sesi Supabase Auth di tiap request. Server Component nggak bisa
// nulis cookie sendiri (batasan Next.js), jadi refresh token HARUS lewat
// middleware ini — tanpa ini, sesi login bisa kedaluwarsa tanpa ke-refresh
// walau usernya masih aktif pakai situsnya.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Panggilan ini yang men-trigger refresh token kalau perlu.
  await supabase.auth.getUser()

  return response
}