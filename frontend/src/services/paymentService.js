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
   * Buat invoice di Bayarin untuk upgrade plan.
   * Backend akan memanggil Bayarin API dan mengembalikan payment_url.
   * @param {string} plan - 'pro' | 'team'
   * @returns {Promise<Object>} { invoice_id, payment_url, amount, plan, qr_image_url }
   */
  createInvoice: async (plan) => {
    const response = await api.post(`${PAYMENT_BASE}/create-invoice/`, { plan })
    return getResponseData(response)
  },

  /**
   * Cek status invoice di Bayarin secara real-time.
   * @param {string} invoiceId - invoice_id dari Bayarin
   * @returns {Promise<Object>} { invoice_id, status, amount, paid_at, expires_at, plan }
   */
  checkInvoice: async (invoiceId) => {
    const response = await api.get(`${PAYMENT_BASE}/check-invoice/`, {
      params: { invoice_id: invoiceId },
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
   * Fallback: upload bukti transfer manual (jika Bayarin tidak tersedia).
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
