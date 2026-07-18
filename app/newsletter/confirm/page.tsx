import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import { createAdminClient } from '@/utils/supabase/admin'

interface ConfirmPageProps {
  searchParams: Promise<{ token?: string }>
}

type ConfirmStatus = 'confirmed' | 'already' | 'invalid'

// Halaman yang dibuka dari link di email konfirmasi newsletter (double
// opt-in). Sengaja pakai Server Component biasa (bukan Route Handler)
// supaya bisa langsung render pesan hasil konfirmasi tanpa redirect.
export default async function ConfirmNewsletterPage({ searchParams }: ConfirmPageProps) {
  const { token } = await searchParams
  const status = token ? await confirmSubscription(token) : 'invalid'

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      {status === 'invalid' ? (
        <XCircle className="h-12 w-12 text-red-500" />
      ) : (
        <CheckCircle2 className="h-12 w-12 text-[var(--color-primary)]" />
      )}

      <h1 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">
        {status === 'confirmed' && 'Email Terkonfirmasi!'}
        {status === 'already' && 'Sudah Terkonfirmasi'}
        {status === 'invalid' && 'Link Tidak Valid'}
      </h1>

      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {status === 'confirmed' &&
          'Kamu akan mulai terima update loker remote terbaru dari RemotIn.'}
        {status === 'already' && 'Email kamu sudah terverifikasi sebelumnya. Nggak perlu tindakan lagi.'}
        {status === 'invalid' && 'Link konfirmasi ini nggak valid atau sudah kedaluwarsa.'}
      </p>

      <Link
        href="/"
        className="mt-6 text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        Kembali ke Beranda
      </Link>
    </main>
  )
}

async function confirmSubscription(token: string): Promise<ConfirmStatus> {
  // Pakai admin client (service role, bypass RLS) — bukan client biasa,
  // karena RLS newsletter_subscribers cuma izinkan publik INSERT, tidak
  // SELECT/UPDATE (lihat 09_newsletter_subscribers.sql). Ini AMAN karena
  // akses di sini dibatasi oleh kepemilikan token UUID acak yang cuma
  // dikirim lewat email — pola yang sama dengan link reset password di
  // web manapun — BUKAN exposed sebagai SELECT publik ke seluruh tabel.
  const supabase = createAdminClient()

  // Cek dulu status confirmed_at sebelum update, biar bisa bedain pesan
  // "baru dikonfirmasi sekarang" vs "sudah dikonfirmasi dari dulu" —
  // dan supaya link yang dibuka berkali-kali tetap aman (idempotent).
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('confirmed_at')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (!existing) return 'invalid'
  if (existing.confirmed_at) return 'already'

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('confirmation_token', token)

  if (error) {
    console.error('Gagal konfirmasi subscriber newsletter:', error.message)
    return 'invalid'
  }

  return 'confirmed'
}