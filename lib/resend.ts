import { SITE_URL } from '@/lib/site-config'

// Alamat pengirim newsletter. SELALU pakai domain sandbox Resend
// (onboarding@resend.dev) sampai domain custom remotinjobs.com dibeli &
// diverifikasi di Resend (lihat Bagian 3 dokumentasi project — domain masih
// ditunda). Selama domain belum diverifikasi, Resend cuma izinkan kirim ke
// alamat email pemilik akun Resend sendiri, bukan ke sembarang subscriber.
// Begitu domain sudah aktif: tinggal set RESEND_FROM_EMAIL di .env.local &
// Environment Variables Vercel, TIDAK perlu ubah kode ini.
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'RemotIn <onboarding@resend.dev>'

// Kirim email konfirmasi (double opt-in) ke subscriber baru newsletter.
// Pakai fetch langsung ke REST API Resend, bukan package `resend` —
// konsisten dengan pola integrasi Midtrans di lib/midtrans.ts (satu
// dependency lebih sedikit buat di-maintain).
export async function sendConfirmationEmail(email: string, token: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY belum di-set di .env.local')
  }

  const confirmUrl = `${SITE_URL}/newsletter/confirm?token=${token}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [email],
      subject: 'Konfirmasi langganan RemotIn',
      html: buildConfirmationEmailHtml(confirmUrl),
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Resend API error (${res.status}): ${errText}`)
  }
}

function buildConfirmationEmailHtml(confirmUrl: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #0E6E5B; font-size: 20px; margin-bottom: 4px;">RemotIn</h1>
      <p style="color: #16231F; font-size: 14px; line-height: 1.6;">Terima kasih sudah daftar newsletter RemotIn. Klik tombol di bawah untuk konfirmasi alamat email kamu dan mulai terima info loker remote terbaru.</p>
      <a href="${confirmUrl}" style="display: inline-block; margin-top: 16px; background: #0E6E5B; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;">Konfirmasi Email</a>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Kalau kamu nggak merasa daftar di RemotIn, abaikan saja email ini.</p>
    </div>
  `
}