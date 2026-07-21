import { cookies } from 'next/headers'
import crypto from 'crypto'

export const ADMIN_COOKIE_NAME = 'remotin_admin'
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7 // 7 hari

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex')
}

// Cookie value = "<expiry>.<hmac>" — BUKAN password mentah. Kalau cookie
// ini bocor, yang kebobol cuma token sesi (scope: "admin login sampai
// waktu X"), bukan password admin itu sendiri.
export async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return false

  const value = (await cookies()).get(ADMIN_COOKIE_NAME)?.value
  if (!value) return false

  const [expiryStr, sig] = value.split('.')
  if (!expiryStr || !sig || Date.now() > Number(expiryStr)) return false

  const expected = Buffer.from(sign(expiryStr, secret), 'hex')
  const actual = Buffer.from(sig, 'hex')
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: sesi admin tidak valid atau sudah habis.')
  }
}

export function createSessionCookieValue(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET belum di-set.')
  const expiry = String(Date.now() + SESSION_MAX_AGE_MS)
  return `${expiry}.${sign(expiry, secret)}`
}