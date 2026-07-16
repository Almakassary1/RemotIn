'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createSnapTransaction } from '@/lib/midtrans'
import { FEATURED_PRICE } from '@/lib/payment-config'

interface CreatePaymentResult {
  success: boolean
  snapToken?: string
  error?: string
}

export async function createFeaturedPayment(jobId: string): Promise<CreatePaymentResult> {
  const supabase = createAdminClient()

  const { data: job } = await supabase.from('jobs').select('id, title').eq('id', jobId).single()
  if (!job) {
    return { success: false, error: 'Loker tidak ditemukan.' }
  }

  // Cegah bayar dobel untuk loker yang sama
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('job_id', jobId)
    .eq('status', 'settlement')
    .maybeSingle()

  if (existingPayment) {
    return { success: false, error: 'Loker ini sudah pernah dibayar Featured.' }
  }

  // order_id harus unik per transaksi di sisi Midtrans
  const orderId = `remotin-${jobId.slice(0, 8)}-${Date.now()}`

  try {
    const transaction = await createSnapTransaction({
      orderId,
      amount: FEATURED_PRICE,
      itemName: `Featured: ${job.title}`,
    })

    const { error: insertError } = await supabase.from('payments').insert({
      job_id: jobId,
      order_id: orderId,
      amount: FEATURED_PRICE,
      status: 'pending',
    })

    if (insertError) {
      console.error('Gagal menyimpan record payment:', insertError.message)
      return { success: false, error: 'Gagal memulai pembayaran. Silakan coba lagi.' }
    }

    return { success: true, snapToken: transaction.token }
  } catch (err) {
    console.error('Gagal membuat transaksi Midtrans:', err)
    return { success: false, error: 'Gagal memulai pembayaran. Silakan coba lagi.' }
  }
}