'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wifi, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Cari Loker', href: '/' },
  { label: 'Kategori', href: '/#kategori' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    // Catatan: opacity /80 sengaja pakai hex literal (#F7F5F0), bukan var(--color-bg).
    // Tailwind tidak bisa menerapkan modifier opasitas (/80) pada arbitrary CSS variable
    // secara konsisten, jadi untuk kasus semi-transparent kita tulis hex-nya langsung.
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-line)] bg-[#F7F5F0]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary)]">
            <Wifi className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
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
          </div>
        </nav>
      )}
    </header>
  )
}
