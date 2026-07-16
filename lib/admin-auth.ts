import { cookies } from 'next/headers'

export const ADMIN_COOKIE_NAME = 'remotin_admin'

/**
 * Cek apakah request saat ini punya cookie admin yang valid.
 *
 * PENTING: dipakai di app/admin/page.tsx DAN di setiap Server Action di
 * app/admin/actions.ts — jangan hanya andalkan pengecekan di halaman,
 * karena Server Action tetap bisa dipanggil sebagai endpoint tersendiri
 * dari luar UI kalau tidak divalidasi ulang di dalamnya.
 */
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return Boolean(value) && Boolean(process.env.ADMIN_PASSWORD) && value === process.env.ADMIN_PASSWORD
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: sesi admin tidak valid atau sudah habis.')
  }
}