// Satu sumber kebenaran untuk URL & nama situs — dipakai di sitemap.ts,
// robots.ts, metadata Open Graph, dan JSON-LD JobPosting.
//
// PENTING: tambahkan NEXT_PUBLIC_SITE_URL di .env.local dan di
// Environment Variables Vercel setelah domain remotinjobs.com aktif,
// misal: NEXT_PUBLIC_SITE_URL=https://remotinjobs.com
// Selama belum di-set, otomatis fallback ke localhost supaya development
// tetap jalan normal.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
export const SITE_NAME = 'RemotIn'