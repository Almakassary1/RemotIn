import type { Metadata } from 'next'
import { Mail, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kontak — RemotIn',
  description: 'Hubungi tim RemotIn untuk pertanyaan, masukan, atau laporan loker.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-lg px-6 py-14 text-center sm:py-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)] sm:text-4xl">
          Hubungi Kami
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
          Ada pertanyaan, masukan, atau menemukan loker yang mencurigakan? Kirim email ke kami,
          kami akan balas secepatnya.
        </p>

        <a
          href="mailto:hello@remotinjobs.com"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A5347]"
        >
          <Mail className="h-4 w-4" />
          hello@remotinjobs.com
        </a>

        <div className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-left">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">
                Melaporkan loker yang mencurigakan
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Sertakan link halaman loker yang dimaksud di email kamu, supaya tim kami bisa
                langsung meninjaunya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}