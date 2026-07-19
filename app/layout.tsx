import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RemotIn — Loker Remote & WFH Indonesia',
    description: DEFAULT_DESCRIPTION,
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
      </body>
    </html>
  )
}