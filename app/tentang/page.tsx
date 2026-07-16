import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tentang Kami — RemotIn',
  description: 'RemotIn adalah portal kurasi lowongan kerja remote & WFH untuk talenta Indonesia.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)] sm:text-4xl">
            Tentang RemotIn
          </h1>
          <p className="mt-3 text-[15px] text-[var(--color-muted)]">
            Portal kurasi lowongan kerja remote & WFH, dibuat khusus untuk talenta Indonesia.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-relaxed text-[var(--color-muted)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Kenapa RemotIn ada</h2>
            <p className="mt-2">
              Peluang kerja remote makin banyak, tapi mencarinya sering merepotkan — tersebar di
              puluhan grup Telegram, komunitas LinkedIn, dan job board internasional yang tidak
              selalu relevan dengan konteks Indonesia. RemotIn hadir untuk mengumpulkan loker
              remote & WFH yang benar-benar terbuka untuk talenta Indonesia, dalam satu tempat
              yang rapi dan mudah dicari.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Untuk siapa</h2>
            <p className="mt-2">
              Fokus kami ada di lima kategori: Engineering, Design, Marketing, Admin & Virtual
              Assistant, dan Customer Service — bidang-bidang yang paling banyak dicari dan paling
              siap dikerjakan remote oleh talenta Indonesia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              Bagaimana kami bekerja
            </h2>
            <p className="mt-2">
              Setiap loker yang masuk lewat halaman{' '}
              <Link
                href="/post-job"
                className="text-[var(--color-primary)] underline underline-offset-2"
              >
                Pasang Loker
              </Link>{' '}
              ditinjau dulu oleh tim kami sebelum tayang, dan otomatis kami tandai kedaluwarsa
              setelah 30 hari — supaya daftar loker di RemotIn tetap relevan dan tidak basi.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Model layanan kami</h2>
            <p className="mt-2">
              RemotIn 100% gratis untuk pencari kerja, selamanya. Perusahaan dan recruiter juga
              bisa memasang loker secara gratis; ke depannya kami akan menawarkan opsi
              &quot;Featured&quot; berbayar bagi yang ingin lokernya lebih menonjol.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-[#0A5347]"
          >
            Cari Loker
          </Link>
          <Link
            href="/post-job"
            className="rounded-full border border-[var(--color-line)] px-6 py-3 text-center text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-primary)]"
          >
            Pasang Loker
          </Link>
        </div>
      </div>
    </main>
  )
}