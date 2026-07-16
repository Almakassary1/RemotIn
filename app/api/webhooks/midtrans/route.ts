import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { verifyMidtransSignature } from '@/lib/midtrans'

// Midtrans memanggil endpoint ini server-to-server setiap status transaksi
// berubah (pending -> settlement/expire/cancel/deny). Ini SATU-SATUNYA
// tempat yang boleh mengubah jobs.is_featured jadi true — callback di
// browser (onSuccess di FeaturedUpsell.tsx) cuma untuk UX, tidak dipercaya
// sebagai sumber kebenaran karena bisa dimanipulasi dari sisi client.
export async function POST(request: Request) {
  let payload: {
    order_id: string
    status_code: string
    gross_amount: string
    signature_key: string
    transaction_status: string
    transaction_id?: string
  }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const isValid = verifyMidtransSignature(payload)
  if (!isValid) {
    console.error('Midtrans webhook: signature tidak valid, ditolak.')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const { order_id, transaction_status, transaction_id } = payload
  const supabase = createAdminClient()

  const { data: payment } = await supabase
    .from('payments')
    .select('id, job_id, status')
    .eq('order_id', order_id)
    .single()

  if (!payment) {
    console.error(`Midtrans webhook: order_id ${order_id} tidak ditemukan di database.`)
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Hindari double-processing kalau Midtrans kirim notifikasi yang sama 2x
  if (payment.status === 'settlement') {
    return NextResponse.json({ received: true, note: 'Already processed' })
  }

  if (transaction_status === 'settlement' || transaction_status === 'capture') {
    await supabase
      .from('payments')
      .update({
        status: 'settlement',
        midtrans_transaction_id: transaction_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (payment.job_id) {
      await supabase.from('jobs').update({ is_featured: true }).eq('id', payment.job_id)
    }
  } else if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
    await supabase
      .from('payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', payment.id)
  }

  return NextResponse.json({ received: true })
}