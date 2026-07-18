'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'remotin_saved_jobs'

function readSavedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

// Simpan loker tanpa akun — Fase D #11. Cuma di browser ini saja, nggak
// sinkron ke perangkat lain (itu baru masuk akal kalau sudah ada sistem
// akun beneran, lihat Fase F).
export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<string[]>([])

  // localStorage cuma bisa dibaca di client. Diisi setelah mount (bukan di
  // useState initial value) supaya hasil render server & client pertama
  // sama persis — hindari hydration mismatch.
  useEffect(() => {
    setSavedIds(readSavedIds())
  }, [])

  const isSaved = useCallback((jobId: string) => savedIds.includes(jobId), [savedIds])

  const toggleSaved = useCallback((jobId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { savedIds, isSaved, toggleSaved }
}