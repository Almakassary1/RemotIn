import Link from 'next/link'
import { Mail } from 'lucide-react'
// Instagram & LinkedIn sengaja dihapus dari lucide-react (mereka hanya
// menyediakan ikon UI generik, bukan logo brand) — jadi untuk ikon
// brand/sosial media, kita pakai react-icons.
import { FaInstagram, FaLinkedin } from 'react-icons/fa'

const QUICK_LINKS = [
  { label: 'Cari Loker', href: '/' },
  { label: 'Kategori', href: '/#kategori' },
  { label: 'Pasang Loker', href: '/post-job' },
  { label: 'Tentang Kami', href: '/tentang' },
  { label: 'Kontak', href: '/kontak' },
]

// Statis, mengikuti 5 kategori yang di-seed di Tahap 1 (tabel `categories`).
// Kalau daftar kategori berubah cukup sering, pertimbangkan fetch dari Supabase
// seperti pola di app/page.tsx, dengan Footer diubah jadi async Server Component.
const POPULAR_CATEGORIES = [
  { label: 'Engineering', href: '/kategori/engineering' },
  { label: 'Design', href: '/kategori/design' },
  { label: 'Marketing', href: '/kategori/marketing' },
  { label: 'Admin & Virtual Assistant', href: '/kategori/admin-va' },
  { label: 'Customer Service', href: '/kategori/customer-service' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--color-ink)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F7F5F0]">
                <img src="/logo-mark.svg" alt="RemotIn" className="h-5 w-5" />
              </span>
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F7F5F0]">
                Remot<span className="text-emerald-400">In</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#F7F5F0]/60">
              Portal kurasi lowongan remote &amp; WFH terpercaya untuk talenta Indonesia. Kerja
              dari mana saja, tanpa drama macet.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="text-[#F7F5F0]/50 transition hover:text-emerald-400"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-[#F7F5F0]/50 transition hover:text-emerald-400"
              >
                <FaLinkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@remotinjobs.com"
                aria-label="Email"
                className="text-[#F7F5F0]/50 transition hover:text-emerald-400"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F7F5F0]/40">
              Navigasi Cepat
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#F7F5F0]/70 transition hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kategori Populer */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F7F5F0]/40">
              Kategori Populer
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {POPULAR_CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-[#F7F5F0]/70 transition hover:text-emerald-400"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar: Hak Cipta + link legal */}
        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-[#F7F5F0]/10 pt-6 sm:flex-row">
          <p className="text-xs text-[#F7F5F0]/40">
            © {year} RemotIn. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#F7F5F0]/40">
            <Link href="/privasi" className="transition hover:text-[#F7F5F0]/70">
              Kebijakan Privasi
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/syarat-ketentuan" className="transition hover:text-[#F7F5F0]/70">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}