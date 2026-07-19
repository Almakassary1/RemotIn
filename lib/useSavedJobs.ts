'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const STORAGE_KEY = 'remotin_saved_jobs'

function readLocalIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

// Simpan loker — dua mode:
// - Belum login: disimpan di localStorage browser ini saja (perilaku lama,
//   Fase D #11).
// - Sudah login: disimpan di tabel saved_jobs, sinkron antar-device
//   (Fase F #16). Perpindahan satu-kali dari localStorage ke akun terjadi
//   otomatis lewat components/AuthSync.tsx begitu user berhasil login —
//   hook ini sendiri nggak melakukan penggabungan, cuma baca state terkini.
export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!active) return

      if (user) {
        setUserId(user.id)
        const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id)
        if (active) setSavedIds((data ?? []).map((row) => row.job_id as string))
      } else {
        setUserId(null)
        setSavedIds(readLocalIds())
      }
      if (active) setLoading(false)
    }

    load()

    // Kalau status login berubah selagi halaman terbuka (mis. abis
    // AuthSync selesai gabung data, atau abis logout), muat ulang biar
    // savedIds ikut ke-update tanpa perlu refresh manual.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const isSaved = useCallback((jobId: string) => savedIds.includes(jobId), [savedIds])

  const toggleSaved = useCallback(
    async (jobId: string) => {
      const alreadySaved = savedIds.includes(jobId)

      if (userId) {
        const supabase = createClient()
        if (alreadySaved) {
          await supabase.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', jobId)
        } else {
          await supabase.from('saved_jobs').insert({ user_id: userId, job_id: jobId })
        }
        setSavedIds((prev) => (alreadySaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
      } else {
        setSavedIds((prev) => {
          const next = alreadySaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          return next
        })
      }
    },
    [savedIds, userId]
  )

  return { savedIds, isSaved, toggleSaved, loading, loggedIn: Boolean(userId) }
}