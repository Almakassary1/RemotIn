'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

const STORAGE_KEY = 'remotin_saved_jobs'

// Komponen tak-tampak, di-mount sekali di root layout. Tugasnya cuma satu:
// begitu ada sesi login aktif, gabungkan loker yang tersimpan di
// localStorage browser ini ke akun — sekali per user per browser.
//
// Sengaja TIDAK menyaring lewat nama event ('SIGNED_IN' vs
// 'INITIAL_SESSION') karena keduanya bisa muncul tergantung dari mana sesi
// itu berasal (login lewat Server Action tidak selalu memicu 'SIGNED_IN' di
// client). Yang menjamin proses ini cuma jalan sekali adalah flag
// `remotin_merged_<user_id>` di localStorage, bukan jenis event-nya.
export default function AuthSync() {
  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user
      if (!user) return

      const mergedFlagKey = `remotin_merged_${user.id}`
      if (window.localStorage.getItem(mergedFlagKey)) return

      const raw = window.localStorage.getItem(STORAGE_KEY)
      const localIds: string[] = raw ? JSON.parse(raw) : []

      if (localIds.length > 0) {
        // Cek dulu mana yang masih valid — loker yang sudah dihapus/nggak
        // approved lagi diam-diam di-skip, bukan bikin proses gagal.
        const { data: validJobs } = await supabase
          .from('jobs')
          .select('id')
          .in('id', localIds)
          .eq('is_approved', true)

        const validIds = (validJobs ?? []).map((j) => j.id)

        if (validIds.length > 0) {
          const rows = validIds.map((job_id) => ({ user_id: user.id, job_id }))
          // upsert + ignoreDuplicates: aman kalau sebagian sudah tersimpan
          // duluan dari device lain, nggak dianggap error.
          await supabase
            .from('saved_jobs')
            .upsert(rows, { onConflict: 'user_id,job_id', ignoreDuplicates: true })
        }
      }

      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.setItem(mergedFlagKey, '1')
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}