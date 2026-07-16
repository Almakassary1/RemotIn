import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — RemotIn',
  description: 'Kebijakan privasi RemotIn: informasi apa yang kami kumpulkan dan bagaimana digunakan.',
}

const sectionTitle = 'mt-8 text-lg font-semibold text-[var(--color-ink)]'
const paragraph = 'mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]'
const list =
  'mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-[var(--color-muted)]'
const linkClass = 'text-[var(--color-primary)] underline underline-offset-2'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)] sm:text-4xl">
          Kebijakan Privasi
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Terakhir diperbarui: Juli 2026</p>

        <p className={paragraph}>
          Kebijakan ini menjelaskan bagaimana RemotIn (&quot;kami&quot;) mengumpulkan, menggunakan,
          dan melindungi informasi saat kamu menggunakan situs remotinjobs.com. Dengan
          menggunakan RemotIn, kamu menyetujui praktik yang dijelaskan di sini.
        </p>

        <h2 className={sectionTitle}>1. Informasi yang Kami Kumpulkan</h2>
        <p className={paragraph}>
          RemotIn tidak mewajibkan pencari kerja membuat akun, sehingga kami tidak mengumpulkan
          data pribadi pencari kerja secara langsung. Informasi yang kami simpan berasal dari
          formulir Pasang Loker, yaitu:
        </p>
        <ul className={list}>
          <li>Nama perusahaan, judul posisi, deskripsi pekerjaan, dan detail loker lainnya</li>
          <li>
            Tautan atau alamat email untuk melamar (apply_url), yang kamu sediakan sendiri untuk
            dipublikasikan
          </li>
        </ul>
        <p className={paragraph}>
          Data ini bersifat publik dan memang dimaksudkan untuk ditampilkan di situs.
        </p>

        <h2 className={sectionTitle}>2. Bagaimana Kami Menggunakan Informasi</h2>
        <p className={paragraph}>
          Informasi loker digunakan semata-mata untuk ditampilkan di RemotIn agar dapat ditemukan
          oleh pencari kerja. Kami tidak menjual atau menyewakan data ini ke pihak ketiga untuk
          tujuan pemasaran.
        </p>

        <h2 className={sectionTitle}>3. Cookie</h2>
        <p className={paragraph}>
          Saat ini RemotIn tidak menggunakan cookie pelacakan pihak ketiga untuk pengunjung
          publik. Satu-satunya cookie yang kami gunakan adalah cookie sesi internal untuk halaman
          admin (login moderasi), yang tidak terkait dengan data pengunjung biasa. Kebijakan ini
          akan diperbarui jika kami menambahkan alat analitik di masa depan.
        </p>

        <h2 className={sectionTitle}>4. Tautan ke Situs Eksternal</h2>
        <p className={paragraph}>
          Tombol &quot;Lamar Sekarang&quot; mengarahkan kamu ke situs, formulir, atau email pihak
          ketiga (perusahaan perekrut) yang berada di luar kendali kami. RemotIn tidak
          bertanggung jawab atas praktik privasi di situs eksternal tersebut — periksa kebijakan
          privasi masing-masing perusahaan sebelum mengirimkan data pribadi kamu ke sana.
        </p>

        <h2 className={sectionTitle}>5. Penyimpanan & Keamanan Data</h2>
        <p className={paragraph}>
          Data loker disimpan menggunakan infrastruktur Supabase dengan kontrol akses (Row Level
          Security) yang membatasi siapa saja yang bisa membaca, mengubah, atau menghapus data.
        </p>

        <h2 className={sectionTitle}>6. Hak Kamu</h2>
        <p className={paragraph}>
          Kalau kamu memasang loker dan ingin datanya diperbarui atau dihapus, hubungi kami lewat
          halaman{' '}
          <a href="/kontak" className={linkClass}>
            Kontak
          </a>
          .
        </p>

        <h2 className={sectionTitle}>7. Perubahan Kebijakan</h2>
        <p className={paragraph}>
          Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan akan berlaku segera
          setelah dipublikasikan di halaman ini.
        </p>

        <h2 className={sectionTitle}>8. Hubungi Kami</h2>
        <p className={paragraph}>
          Pertanyaan seputar kebijakan ini bisa dikirim ke{' '}
          <a href="mailto:hello@remotinjobs.com" className={linkClass}>
            hello@remotinjobs.com
          </a>
          .
        </p>

        <p className="mt-10 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-xs leading-relaxed text-[var(--color-muted)]">
          Catatan: dokumen ini adalah draf awal yang mengikuti praktik data RemotIn saat ini,
          bukan nasihat hukum. Sebaiknya diperiksa oleh konsultan hukum sebelum situs go-live,
          terutama sebelum mengintegrasikan pembayaran atau alat analitik baru.
        </p>
      </div>
    </main>
  )
}