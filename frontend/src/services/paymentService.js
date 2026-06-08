import api, { getResponseData } from './api'

const PAYMENT_BASE = '/api/payment'

const paymentService = {
  /**
   * Ambil data subscription aktif milik user yang sedang login.
   * @returns {Promise<Object>} subscription data + features map
   */
  getSubscription: async () => {
    const response = await api.get(`${PAYMENT_BASE}/subscription/`)
    return getResponseData(response)
  },

  /**
   * Buat transaksi QRIS baru di KlikQRIS via backend.
   * @param {string} plan - 'pro' | 'team'
   * @returns {Promise<Object>} { order_id, amount, total_amount, qris_url, qris_image, expired_at, signature, plan, status }
   */
  createInvoice: async (plan) => {
    const response = await api.post(`${PAYMENT_BASE}/create-invoice/`, { plan })
    return getResponseData(response)
  },

  /**
   * Cek status transaksi di KlikQRIS secara real-time.
   * @param {string} orderId - order_id transaksi (format EDUTASK-XXXXXXXX)
   * @returns {Promise<Object>} { order_id, status, amount, total_amount, paid_at, expired_at, plan }
   */
  checkInvoice: async (orderId) => {
    const response = await api.get(`${PAYMENT_BASE}/check-invoice/`, {
      params: { order_id: orderId },
    })
    return getResponseData(response)
  },

  /**
   * Ambil riwayat pengajuan pembayaran milik user.
   * @returns {Promise<Array>} list PaymentProof
   */
  getPaymentProofs: async () => {
    const response = await api.get(`${PAYMENT_BASE}/proofs/`)
    return getResponseData(response)
  },

  /**
   * Fallback: upload bukti transfer manual.
   * @param {FormData} formData - berisi field 'plan' dan 'proof' (file)
   * @returns {Promise<Object>} { id, status }
   */
  submitProof: async (formData) => {
    const response = await api.post(`${PAYMENT_BASE}/submit-proof/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return getResponseData(response)
  },
}

export default paymentService
