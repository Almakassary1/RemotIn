import type { Metadata } from 'next'
import Link from 'next/link'
import FaqAccordion from '@/components/FaqAccordion'

export const metadata: Metadata = {
  title: 'FAQ — RemotIn',
  description: 'Pertanyaan yang sering ditanyakan seputar RemotIn, buat pencari kerja maupun perusahaan.',
}

const FAQ_GROUPS = [
  {
    title: 'Untuk Pencari Kerja',
    items: [
      {
        question: 'Apakah RemotIn gratis?',
        answer: 'Ya, 100% gratis buat pencari kerja, selamanya. Nggak ada biaya tersembunyi buat cari, filter, atau melamar loker.',
      },
      {
        question: 'Perlu bikin akun buat cari loker?',
        answer:
          'Nggak wajib. Kamu bisa cari, filter, dan buka detail loker tanpa akun sama sekali. Akun cuma dibutuhkan kalau kamu mau loker yang disimpan sinkron antar-device (misal simpan dari HP, buka lagi dari laptop).',
      },
      {
        question: 'Gimana cara melamar loker?',
        answer:
          'Klik tombol "Lamar Sekarang" di halaman detail loker — kamu akan diarahkan ke website atau email lamaran resmi dari perusahaan yang bersangkutan. RemotIn nggak ikut campur di proses lamaran, wawancara, atau negosiasi setelahnya, itu sepenuhnya antara kamu dan perusahaan.',
      },
      {
        question: 'Apakah semua loker di RemotIn beneran terbuka untuk talenta di Indonesia?',
        answer:
          'Itu tujuan utama kami, tapi karena masih tahap awal, kamu tetap disarankan baca detail dan persyaratan tiap loker sebelum melamar — beberapa sumber loker eksternal kadang punya syarat lokasi yang perlu dicek ulang.',
      },
      {
        question: 'Gimana cara menyimpan loker favorit?',
        answer:
          'Klik ikon bookmark di kartu loker atau halaman detail. Tanpa akun, loker tersimpan cuma di browser yang kamu pakai saat itu. Kalau kamu masuk/daftar akun, loker tersimpan otomatis ikut sinkron ke akun kamu.',
      },
      {
        question: 'Kenapa loker yang saya simpan tiba-tiba hilang dari daftar?',
        answer:
          'Loker otomatis dianggap kedaluwarsa dan berhenti ditampilkan 30 hari setelah tanggal posting, biar daftar loker di RemotIn tetap relevan. Kalau loker yang kamu simpan udah lewat 30 hari, itu kemungkinan besar penyebabnya.',
      },
    ],
  },
  {
    title: 'Untuk Perusahaan',
    items: [
      {
        question: 'Gimana cara pasang loker di RemotIn?',
        answer:
          'Klik "+ Pasang Loker" di bagian atas halaman, isi form (judul, deskripsi, persyaratan, dll), lalu submit. Tim kami akan meninjau sebelum loker tayang ke publik.',
      },
      {
        question: 'Berapa biaya pasang loker?',
        answer:
          'Gratis. Ada opsi upgrade "Featured" berbayar kalau kamu mau lokernya lebih menonjol dan sering muncul di posisi atas daftar pencarian.',
      },
      {
        question: 'Kenapa loker saya belum tayang?',
        answer:
          'Setiap loker yang masuk ditinjau manual dulu oleh tim kami sebelum dipublikasikan, biasanya makan waktu beberapa jam sampai 1-2 hari kerja. Ini buat menjaga kualitas & kepercayaan pencari kerja terhadap listing di RemotIn.',
      },
      {
        question: 'Berapa lama loker saya tayang?',
        answer:
          '30 hari sejak tanggal posting, setelah itu otomatis nggak ditampilkan lagi ke publik. Kalau posisinya masih terbuka, kamu bisa pasang ulang.',
      },
      {
        question: 'Bisa edit atau hapus loker yang sudah dipasang?',
        answer:
          'Untuk saat ini, hubungi kami lewat halaman Kontak dengan menyertakan link loker yang dimaksud, tim kami akan bantu proses perubahan atau penghapusannya.',
      },
    ],
  },
  {
    title: 'Umum',
    items: [
      {
        question: 'Apa itu RemotIn?',
        answer:
          'RemotIn adalah portal kurasi lowongan kerja remote & WFH yang dibuat khusus untuk talenta Indonesia, mencakup lima kategori: Engineering, Design, Marketing, Admin & Virtual Assistant, dan Customer Service.',
      },
      {
        question: 'Gimana loker di RemotIn diverifikasi?',
        answer:
          'Tim kami meninjau manual setiap loker yang masuk sebelum tayang, mengecek relevansi dengan kategori remote/WFH serta indikasi spam atau penipuan.',
      },
      {
        question: 'Ada aplikasi mobile RemotIn?',
        answer: 'Belum — untuk saat ini RemotIn berbasis web, tapi bisa dibuka dengan lancar lewat browser di HP.',
      },
      {
        question: 'Saya nemu loker yang mencurigakan, gimana melaporkannya?',
        answer:
          'Kirim email lewat halaman Kontak dan sertakan link halaman loker yang dimaksud, biar tim kami bisa langsung meninjaunya.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-ink)] sm:text-4xl">
            Pertanyaan yang Sering Ditanyakan
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
            Nggak nemu jawabannya di sini? Hubungi kami lewat halaman{' '}
            <Link href="/kontak" className="text-[var(--color-primary)] underline underline-offset-2">
              Kontak
            </Link>
            .
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-10">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">{group.title}</h2>
              <FaqAccordion items={group.items} />
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}