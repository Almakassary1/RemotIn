'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

const NAV_LINKS = [
  { label: 'Cari Loker', href: '/' },
  { label: 'Kategori', href: '/#kategori' },
  { label: 'Tersimpan', href: '/tersimpan' },
]

interface NavbarProps {
  // Cukup email-nya saja yang dikirim dari Server Component — hindari
  // kirim seluruh object user (ada metadata provider dll yang nggak perlu
  // ikut ke client bundle).
  userEmail: string | null
}

export default function Navbar({ userEmail }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Hapus tanda "sudah pernah digabung" sebelum logout — supaya kalau
  // orang simpan loker lagi selagi belum login (jadi tamu), terus login
  // balik ke akun yang sama, loker yang disimpan di masa "tamu" itu ikut
  // digabung lagi. Tanpa ini, penggabungan cuma jalan sekali seumur hidup
  // per akun, bukan sekali per sesi login.
  async function handleSignOut() {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('remotin_merged_'))
      .forEach((key) => window.localStorage.removeItem(key))
    await signOut()
  }

  return (
    // Catatan: opacity /80 sengaja pakai hex literal (#F7F5F0), bukan var(--color-bg).
    // Tailwind tidak bisa menerapkan modifier opasitas (/80) pada arbitrary CSS variable
    // secara konsisten, jadi untuk kasus semi-transparent kita tulis hex-nya langsung.
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-line)] bg-[#F7F5F0]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <img src="/logo-mark.svg" alt="RemotIn" className="h-8 w-8" />
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
            Remot<span className="text-[var(--color-primary)]">In</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-[var(--color-primary)] ${
                pathname === link.href ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/post-job"
            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0A5347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            + Pasang Loker
          </Link>

          <div className="h-5 w-px bg-[var(--color-line)]" />

          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="max-w-[140px] truncate text-sm text-[var(--color-muted)]" title={userEmail}>
                {userEmail}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] transition hover:text-[var(--color-primary)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/masuk"
                className="text-sm font-medium text-[var(--color-ink)] transition hover:text-[var(--color-primary)]"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="text-sm font-medium text-[var(--color-ink)] transition hover:text-[var(--color-primary)]"
              >
                Daftar
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <nav className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)]'
                    : 'text-[var(--color-ink)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/post-job"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              + Pasang Loker
            </Link>

            <div className="mt-2 border-t border-[var(--color-line)] pt-3">
              {userEmail ? (
                <div className="flex items-center justify-between px-3">
                  <span className="truncate text-sm text-[var(--color-muted)]">{userEmail}</span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/masuk"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink)]"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/daftar"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink)]"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}