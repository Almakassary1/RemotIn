'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

// Komponen kecil ini sengaja dipisah dari JobBoard/FilterBar supaya
// cuma bagian INI yang perlu jadi Client Component (butuh state lokal
// + debounce). Sisanya (JobBoard) tetap Server Component biasa.
export default function SearchBox() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  // Baru update URL 400ms setelah user berhenti mengetik — supaya nggak
  // nembak request baru ke server tiap 1 huruf diketik.
  useEffect(() => {
    const trimmed = value.trim()
    const current = searchParams.get('q') ?? ''
    if (trimmed === current) return

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (trimmed) {
        params.set('q', trimmed)
      } else {
        params.delete('q')
      }
      params.delete('jumlah') // balik ke halaman pertama tiap kata kunci berubah
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, 400)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] lg:mx-0">
      <Search className="h-4 w-4 flex-shrink-0 text-[var(--color-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari posisi atau nama perusahaan..."
        className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
      />
    </div>
  )
}