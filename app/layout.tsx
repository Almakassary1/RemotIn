import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { GoogleAnalytics } from '@next/third-parties/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuthSync from '@/components/AuthSync'
import { createClient } from '@/utils/supabase/server'
import { SITE_URL, SITE_NAME } from '@/lib/site-config'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
})

const DEFAULT_DESCRIPTION =
  'Portal kurasi lowongan kerja remote dan WFH terpercaya untuk talenta Indonesia.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'RemotIn — Loker Remote & WFH Indonesia',
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'RemotIn — Loker Remote & WFH Indonesia',
    description: DEFAULT_DESCRIPTION,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RemotIn — Loker Remote & WFH Indonesia',
    description: DEFAULT_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="id">
      <body
        className={`${fraunces.variable} ${jakarta.variable} flex min-h-screen flex-col font-[family-name:var(--font-body)]`}
      >
        {/* Tak-tampak — cuma nunggu event login buat gabung loker
            localStorage ke akun, lihat components/AuthSync.tsx */}
        <AuthSync />
        <Navbar userEmail={user?.email ?? null} />
        {/* flex-1 di sini + flex-col di body = footer selalu menempel di bawah,
            walau konten halaman pendek (mis. halaman kosong/error) */}
        <div className="flex-1">{children}</div>
        <Footer />

        {/* Vercel Analytics — otomatis aktif begitu di-deploy, nggak butuh
            env var apa pun, tinggal diaktifkan sekali di dashboard Vercel
            (Project → Analytics → Enable). */}
        <Analytics />

        {/* Google Analytics — cuma render kalau env var-nya di-set, biar
            nggak ada script GA yang nyoba jalan pakai ID kosong waktu
            development lokal atau sebelum GA_ID di-set di Vercel. */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}