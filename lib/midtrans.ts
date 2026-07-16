import crypto from 'crypto'

const MIDTRANS_BASE_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com'
    : 'https://app.sandbox.midtrans.com'

interface SnapTransactionParams {
  orderId: string
  amount: number
  itemName: string
}

interface SnapTransactionResponse {
  token: string
  redirect_url: string
}

// Membuat transaksi baru di Midtrans, dapat token untuk dipakai
// window.snap.pay(token) di sisi client.
export async function createSnapTransaction(
  params: SnapTransactionParams
): Promise<SnapTransactionResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY belum di-set di .env.local')
  }

  const auth = Buffer.from(`${serverKey}:`).toString('base64')

  const res = await fetch(`${MIDTRANS_BASE_URL}/snap/v1/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      item_details: [
        {
          id: 'featured-job-post',
          price: params.amount,
          quantity: 1,
          name: params.itemName.slice(0, 50), // Midtrans batasi nama item 50 karakter
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Midtrans API error (${res.status}): ${errText}`)
  }

  return res.json()
}

interface MidtransNotificationPayload {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
  transaction_status: string
}

// Verifikasi signature dari notifikasi webhook Midtrans — memastikan
// request beneran datang dari Midtrans, bukan orang iseng yang manggil
// webhook kita langsung buat nge-fake status "sukses" dan dapat Featured
// gratis. Rumus resmi dari dokumentasi Midtrans:
// SHA512(order_id + status_code + gross_amount + server_key)
export function verifyMidtransSignature(payload: MidtransNotificationPayload): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) return false

  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`
  const computedSignature = crypto.createHash('sha512').update(raw).digest('hex')

  return computedSignature === payload.signature_key
}