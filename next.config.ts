import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

// ---------------------------------------------------------------------
// CSP sengaja dipasang dalam mode "Report-Only" dulu, BUKAN mode blokir
// penuh. Bedanya:
// - Content-Security-Policy         -> browser MEMBLOKIR yang melanggar
// - Content-Security-Policy-Report-Only -> browser cuma MENCATAT ke
//   console, semua tetap jalan seperti biasa
//
// Ini karena situs ini pakai beberapa script pihak ketiga (Midtrans Snap
// buat pembayaran, Turnstile buat anti-spam form loker, Google Analytics,
// Vercel Analytics) — kalau ada 1 domain yang kelewat dari daftar di
// bawah dan langsung dipasang mode blokir, bisa bikin proses BAYAR atau
// POSTING LOKER rusak diam-diam tanpa pesan error yang jelas ke user.
//
// SEBELUM ganti "Content-Security-Policy-Report-Only" jadi
// "Content-Security-Policy" (hapus "-Report-Only" di key-nya, lihat di
// bagian headers() bawah), wajib dites dulu di production:
//   1. Buka remotinjobs.com, tekan F12 > tab Console
//   2. Coba SEMUA fitur: isi & submit form post-job (termasuk Turnstile-nya
//      kelihatan jalan), buka halaman detail loker, coba alur bayar
//      featured loker, cek Navbar login/logout
//   3. Kalau ada baris di Console yang bunyinya mirip "Refused to load..."
//      atau "violates the following Content Security Policy directive",
//      catat domain yang disebut, tambahkan ke baris cspDirectives yang
//      sesuai di bawah
//   4. Ulangi sampai Console bersih dari pesan itu, baru aman diganti ke
//      mode blokir penuh
// ---------------------------------------------------------------------
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://app.midtrans.com https://app.sandbox.midtrans.com https://www.googletagmanager.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://nteatwvbkgbtkyasrhyh.supabase.co https://ui-avatars.com",
  "font-src 'self' data:",
  "connect-src 'self' https://nteatwvbkgbtkyasrhyh.supabase.co https://vitals.vercel-insights.com https://va.vercel-scripts.com https://www.google-analytics.com https://analytics.google.com",
  "frame-src https://challenges.cloudflare.com https://app.midtrans.com https://app.sandbox.midtrans.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ')

const nextConfig: NextConfig = {
  images: {
    // Izinkan next/image mengoptimasi logo perusahaan yang di-upload ke
    // Supabase Storage (bucket company-logos) — tanpa ini, next/image
    // menolak gambar dari domain luar demi keamanan.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nteatwvbkgbtkyasrhyh.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Berlaku untuk semua halaman & route
        source: '/(.*)',
        headers: [
          // Cegah situs ini di-embed lewat <iframe> di situs lain
          // (mencegah serangan clickjacking).
          { key: 'X-Frame-Options', value: 'DENY' },
          // Cegah browser "menebak" tipe sebuah file dari isinya kalau
          // beda dari Content-Type yang dikirim server.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Waktu user klik link keluar dari situs ini, kirim referrer
          // secukupnya aja (bukan URL lengkap dengan semua parameter).
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Situs ini nggak pernah butuh akses kamera/mikrofon/lokasi
          // browser, jadi matikan eksplisit.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // CSP cuma dipasang di production (bukan pas `npm run dev`),
          // biar nggak ganggu proses development lokal (hot-reload dsb).
          ...(isProd
            ? [{ key: 'Content-Security-Policy-Report-Only', value: cspDirectives }]
            : []),
        ],
      },
    ]
  },
};

export default nextConfig;