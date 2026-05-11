/**
 * EduTask Auth Service
 * Semua API call yang berhubungan dengan autentikasi
 */
import api, { saveTokens, clearTokens } from './api'

const AUTH_BASE = '/api/auth'

const authService = {
  register: async (data) => {
    const response = await api.post(`${AUTH_BASE}/register/`, data)
    const { tokens, user } = response.data.data
    saveTokens(tokens)
    return { user, tokens }
  },

  registerUmum: async (data) => {
    const response = await api.post(`${AUTH_BASE}/register/umum`, data)
    const { tokens, user } = response.data.data
    saveTokens(tokens)
    return { user, tokens }
  },

  registerMahasiswa: async (data) => {
    const response = await api.post(`${AUTH_BASE}/register/mahasiswa`, data)
    const { tokens, user } = response.data.data
    saveTokens(tokens)
    return { user, tokens }
  },

  registerDosen: async (data) => {
    const response = await api.post(`${AUTH_BASE}/register/dosen`, data)
    const { tokens, user } = response.data.data
    saveTokens(tokens)
    return { user, tokens }
  },

  /**
   * Login dengan email + password
   * @param {{ email, password }} credentials
   */
  login: async (credentials) => {
  const response = await api.post(`${AUTH_BASE}/login`, credentials)

  const { access, refresh, user } = response.data.data

  saveTokens({
    access,
    refresh
  })

  return { user }
},

  /**
   * Logout - blacklist refresh token
   */
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      await api.post(`${AUTH_BASE}/logout/`, { refresh })
    } finally {
      clearTokens()
    }
  },

  /**
   * Ambil profil user yang sedang login
   */
  getProfile: async () => {
    const response = await api.get(`${AUTH_BASE}/profile/`)
    return response.data.data
  },

  /**
   * Update profil (nama / foto)
   * @param {FormData|Object} data
   */
  updateProfile: async (data) => {
    const isFormData = data instanceof FormData
    const response = await api.patch(`${AUTH_BASE}/profile/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return response.data.data
  },

  /**
   * Ganti password
   * @param {{ password_lama, password_baru, password_baru_confirm }} data
   */
  changePassword: async (data) => {
    const response = await api.post(`${AUTH_BASE}/change-password/`, data)
    return response.data
  },
}

export default authService
