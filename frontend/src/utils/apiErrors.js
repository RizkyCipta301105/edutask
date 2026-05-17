/**
 * Extract a user-facing message from EduTask API error responses.
 */
export function getApiErrorMessage(error, fallback = 'Terjadi kesalahan.') {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'Permintaan ke server terlalu lama. Periksa koneksi Anda.'
    }
    return 'Tidak dapat terhubung ke server. Pastikan backend Django berjalan (port 8000).'
  }

  const data = error.response.data
  if (!data) return fallback

  if (data.message) return data.message

  const errors = data.errors
  if (!errors) return fallback

  if (typeof errors === 'string') return errors

  const first = Object.values(errors)[0]
  if (Array.isArray(first)) return first.join(' ')
  if (typeof first === 'object' && first !== null) {
    const nested = Object.values(first)[0]
    if (Array.isArray(nested)) return nested.join(' ')
    return nested || fallback
  }
  return first || fallback
}
