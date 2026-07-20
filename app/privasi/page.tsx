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
          Kamu bisa memakai RemotIn buat cari loker tanpa perlu bikin akun sama sekali. Kalau
          kamu memilih bikin akun (opsional, gunanya cuma buat menyimpan loker favorit biar
          sinkron antar-device), informasi yang kami simpan adalah:
        </p>
        <ul className={list}>
          <li>Alamat email (wajib, buat semua metode login)</li>
          <li>
            Password kamu — disimpan dalam bentuk terenkripsi (hashed) oleh penyedia layanan
            autentikasi kami, kami sendiri tidak pernah bisa melihat password asli kamu
          </li>
          <li>
            Kalau login pakai Google: nama dan alamat email dari akun Google kamu (lihat bagian
            5 di bawah)
          </li>
          <li>Daftar loker yang kamu simpan/tandai favorit</li>
        </ul>
        <p className={paragraph}>Selain itu, dari formulir Pasang Loker, kami juga menyimpan:</p>
        <ul className={list}>
          <li>Nama perusahaan, judul posisi, deskripsi pekerjaan, dan detail loker lainnya</li>
          <li>
            Tautan atau alamat email untuk melamar (apply_url), yang kamu sediakan sendiri untuk
            dipublikasikan
          </li>
          <li>Logo perusahaan, kalau diunggah</li>
        </ul>
        <p className={paragraph}>
          Data loker bersifat publik dan memang dimaksudkan untuk ditampilkan di situs. Data akun
          (email, password, loker tersimpan) bersifat privat dan hanya bisa diakses oleh kamu
          sendiri.
        </p>

        <h2 className={sectionTitle}>2. Bagaimana Kami Menggunakan Informasi</h2>
        <p className={paragraph}>
          Informasi loker digunakan semata-mata untuk ditampilkan di RemotIn agar dapat ditemukan
          oleh pencari kerja. Informasi akun digunakan untuk mengautentikasi kamu saat masuk dan
          menyinkronkan loker tersimpan. Kami tidak menjual atau menyewakan data ini ke pihak
          ketiga untuk tujuan pemasaran.
        </p>

        <h2 className={sectionTitle}>3. Cookie & Alat Analitik</h2>
        <p className={paragraph}>RemotIn menggunakan beberapa jenis cookie/penyimpanan lokal:</p>
        <ul className={list}>
          <li>
            <strong>Cookie sesi login</strong> — kalau kamu masuk ke akun, cookie ini menyimpan
            status login kamu, termasuk untuk halaman admin
          </li>
          <li>
            <strong>Google Analytics</strong> — kami pakai untuk memahami berapa banyak pengunjung
            RemotIn dan halaman mana yang paling sering dibuka, dalam bentuk data teragregasi
            (bukan data yang mengidentifikasi kamu secara personal). Google Analytics
            menggunakan cookie pihak ketiga; lihat{' '}
            <a
              href="https://policies.google.com/privacy"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Kebijakan Privasi Google
            </a>{' '}
            untuk detail bagaimana Google memproses data ini
          </li>
          <li>
            <strong>Vercel Analytics</strong> — statistik kunjungan dasar tanpa cookie
          </li>
        </ul>

        <h2 className={sectionTitle}>4. Tautan ke Situs Eksternal</h2>
        <p className={paragraph}>
          Tombol &quot;Lamar Sekarang&quot; mengarahkan kamu ke situs, formulir, atau email pihak
          ketiga (perusahaan perekrut) yang berada di luar kendali kami. RemotIn tidak
          bertanggung jawab atas praktik privasi di situs eksternal tersebut — periksa kebijakan
          privasi masing-masing perusahaan sebelum mengirimkan data pribadi kamu ke sana.
        </p>

        <h2 className={sectionTitle}>5. Login Pakai Google</h2>
        <p className={paragraph}>
          Kalau kamu pilih &quot;Masuk dengan Google&quot;, kami cuma menerima nama dan alamat
          email dari akun Google kamu — bukan kata sandi Google kamu, dan bukan data lain dari
          akun Google kamu (kontak, riwayat pencarian, dst). Proses ini diatur juga oleh{' '}
          <a
            href="https://policies.google.com/privacy"
            className={linkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            Kebijakan Privasi Google
          </a>
          .
        </p>

        <h2 className={sectionTitle}>6. Penyimpanan & Keamanan Data</h2>
        <p className={paragraph}>
          Semua data disimpan menggunakan infrastruktur Supabase dengan kontrol akses (Row Level
          Security) yang membatasi siapa saja yang bisa membaca, mengubah, atau menghapus data —
          termasuk memastikan data akun kamu (loker tersimpan, dll) hanya bisa diakses oleh akun
          kamu sendiri, bukan pengguna lain.
        </p>

        <h2 className={sectionTitle}>7. Hak Kamu</h2>
        <p className={paragraph}>
          Kamu bisa menghapus akun kamu kapan saja dengan menghubungi kami lewat halaman{' '}
          <a href="/kontak" className={linkClass}>
            Kontak
          </a>
          . Kalau kamu memasang loker dan ingin datanya diperbarui atau dihapus, hubungi kami
          lewat halaman yang sama.
        </p>

        <h2 className={sectionTitle}>8. Perubahan Kebijakan</h2>
        <p className={paragraph}>
          Kami dapat memperbarui kebijakan ini dari waktu ke waktu, terutama seiring bertambahnya
          fitur baru. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini.
        </p>

        <h2 className={sectionTitle}>9. Hubungi Kami</h2>
        <p className={paragraph}>
          Pertanyaan seputar kebijakan ini bisa dikirim ke{' '}
          <a href="mailto:remotinjobs@gmail.com" className={linkClass}>
            remotinjobs@gmail.com
          </a>
          .
        </p>

        <p className="mt-10 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-xs leading-relaxed text-[var(--color-muted)]">
          Catatan: dokumen ini adalah draf yang mengikuti praktik data RemotIn saat ini, bukan
          nasihat hukum. Sebaiknya diperiksa oleh konsultan hukum, terutama sebelum fitur
          pembayaran Featured keluar dari mode sandbox/uji coba.
        </p>
      </div>
    </main>
  )
}