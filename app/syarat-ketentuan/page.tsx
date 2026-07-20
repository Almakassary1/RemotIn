import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan — RemotIn',
  description: 'Syarat dan ketentuan penggunaan layanan RemotIn.',
}

const sectionTitle = 'mt-8 text-lg font-semibold text-[var(--color-ink)]'
const paragraph = 'mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]'
const list =
  'mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-[var(--color-muted)]'
const linkClass = 'text-[var(--color-primary)] underline underline-offset-2'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)] sm:text-4xl">
          Syarat & Ketentuan
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Terakhir diperbarui: Juli 2026</p>

        <p className={paragraph}>
          Dengan mengakses atau menggunakan RemotIn (remotinjobs.com), kamu setuju untuk terikat
          dengan syarat & ketentuan berikut.
        </p>

        <h2 className={sectionTitle}>1. Deskripsi Layanan</h2>
        <p className={paragraph}>
          RemotIn adalah platform yang mengumpulkan dan menampilkan lowongan kerja remote/WFH
          untuk talenta Indonesia. Layanan pencarian loker gratis untuk pencari kerja. RemotIn
          bukan agen perekrutan — proses lamaran dan rekrutmen sepenuhnya terjadi antara pencari
          kerja dan perusahaan terkait di luar platform kami.
        </p>

        <h2 className={sectionTitle}>2. Akun Pengguna</h2>
        <p className={paragraph}>
          Membuat akun di RemotIn itu opsional — kamu tetap bisa mencari dan melamar loker tanpa
          akun. Akun cuma dibutuhkan kalau kamu mau loker yang disimpan sinkron antar-device.
          Kalau kamu membuat akun:
        </p>
        <ul className={list}>
          <li>Kamu bertanggung jawab menjaga kerahasiaan password akun kamu</li>
          <li>Satu akun ditujukan untuk satu orang, bukan dipakai bersama</li>
          <li>
            Kamu bisa masuk pakai email & password, atau lewat akun Google — dua-duanya
            diperlakukan sebagai akun yang sama kalau alamat emailnya sama
          </li>
          <li>Kamu bisa minta akun dihapus kapan saja lewat halaman Kontak</li>
        </ul>

        <h2 className={sectionTitle}>3. Memasang Loker</h2>
        <p className={paragraph}>Dengan memasang loker lewat RemotIn, kamu menjamin bahwa:</p>
        <ul className={list}>
          <li>Informasi yang diberikan akurat dan mewakili lowongan yang benar-benar tersedia</li>
          <li>
            Loker tidak bersifat diskriminatif, menipu, atau melanggar hukum yang berlaku di
            Indonesia
          </li>
          <li>Kamu memiliki wewenang untuk memasang loker atas nama perusahaan yang disebutkan</li>
        </ul>

        <h2 className={sectionTitle}>4. Moderasi & Hak Penolakan</h2>
        <p className={paragraph}>
          Setiap loker yang masuk ditinjau oleh tim kami sebelum tayang. RemotIn berhak menolak,
          mengubah, atau menghapus loker apa pun tanpa pemberitahuan sebelumnya, termasuk namun
          tidak terbatas pada loker yang terindikasi spam, penipuan, atau tidak relevan dengan
          kategori remote/WFH.
        </p>

        <h2 className={sectionTitle}>5. Masa Aktif Loker</h2>
        <p className={paragraph}>
          Loker otomatis dianggap kedaluwarsa dan tidak lagi ditampilkan ke publik 30 hari setelah
          tanggal posting, terlepas dari apakah posisi tersebut sudah terisi atau belum.
        </p>

        <h2 className={sectionTitle}>6. Batasan Tanggung Jawab</h2>
        <p className={paragraph}>
          RemotIn hanya berperan sebagai platform kurasi informasi. Kami tidak menjamin
          keakuratan, kelengkapan, atau keabsahan loker yang dipasang oleh pihak ketiga, dan tidak
          bertanggung jawab atas kerugian yang timbul dari interaksi antara pencari kerja dan
          perusahaan perekrut, termasuk proses lamaran, wawancara, atau hubungan kerja.
        </p>

        <h2 className={sectionTitle}>7. Perubahan Layanan</h2>
        <p className={paragraph}>
          Kami dapat mengubah, menangguhkan, atau menghentikan sebagian maupun seluruh fitur
          RemotIn kapan saja, termasuk struktur biaya untuk fitur berbayar seperti Featured Job
          Post.
        </p>

        <h2 className={sectionTitle}>8. Hukum yang Berlaku</h2>
        <p className={paragraph}>
          Syarat & ketentuan ini tunduk pada dan ditafsirkan sesuai hukum yang berlaku di Republik
          Indonesia.
        </p>

        <h2 className={sectionTitle}>9. Kontak</h2>
        <p className={paragraph}>
          Pertanyaan seputar syarat & ketentuan ini bisa dikirim ke{' '}
          <a href="mailto:remotinjobs@gmail.com" className={linkClass}>
            remotinjobs@gmail.com
          </a>
          .
        </p>

        <p className="mt-10 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-xs leading-relaxed text-[var(--color-muted)]">
          Catatan: dokumen ini adalah draf awal yang menyesuaikan fitur RemotIn saat ini, bukan
          nasihat hukum. Sebaiknya diperiksa oleh konsultan hukum sebelum situs go-live, terutama
          sebelum mengintegrasikan pembayaran.
        </p>
      </div>
    </main>
  )
}