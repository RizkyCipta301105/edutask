/**
 * EduTask Auth Service
 * Semua API call yang berhubungan dengan autentikasi
 */
import api, {
  clearTokens,
  getRefreshToken,
  getResponseData,
  saveTokens,
} from './api'

const AUTH_BASE = '/api/auth'

function extractAuthPayload(response) {
  const payload = getResponseData(response)
  if (!payload) {
    throw new Error('Respons autentikasi tidak valid.')
  }
  return payload
}

async function registerWithEndpoint(endpoint, data) {
  const response = await api.post(endpoint, data)
  const payload = extractAuthPayload(response)
  const { tokens, user } = payload
  saveTokens(tokens)
  return { user, tokens }
}

const authService = {
  register: (data) => registerWithEndpoint(`${AUTH_BASE}/register/`, data),

  registerUmum: (data) => registerWithEndpoint(`${AUTH_BASE}/register/umum/`, data),

  registerMahasiswa: (data) => registerWithEndpoint(`${AUTH_BASE}/register/mahasiswa/`, data),

  registerDosen: (data) => registerWithEndpoint(`${AUTH_BASE}/register/dosen/`, data),

  login: async (credentials) => {
    const response = await api.post(`${AUTH_BASE}/login/`, credentials)
    const payload = extractAuthPayload(response)
    const { access, refresh, user } = payload

    if (!access || !refresh) {
      throw new Error('Token login tidak ditemukan dalam respons.')
    }

    saveTokens({ access, refresh })
    return { user }
  },

  logout: async () => {
    const refresh = getRefreshToken()
    try {
      await api.post(`${AUTH_BASE}/logout/`, { refresh })
    } finally {
      clearTokens()
    }
  },

  getProfile: async () => {
    const response = await api.get(`${AUTH_BASE}/profile/`)
    return getResponseData(response)
  },

  updateProfile: async (data) => {
    const isFormData = data instanceof FormData
    const response = await api.patch(`${AUTH_BASE}/profile/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return getResponseData(response)
  },

  changePassword: async (data) => {
    const response = await api.post(`${AUTH_BASE}/change-password/`, data)
    return response.data
  },

  getKelas: async () => {
    const response = await api.get(`${AUTH_BASE}/kelas/`)
    return getResponseData(response)
  },

  // ── Ruang Edukasi ─────────────────────────────────────────────────────────
  getRuang: async () => {
    const response = await api.get(`${AUTH_BASE}/ruang/`)
    return getResponseData(response)
  },
  
  createRuang: async (data) => {
    const response = await api.post(`${AUTH_BASE}/ruang/`, data)
    return getResponseData(response)
  },

  deleteRuang: async (id) => {
    const response = await api.delete(`${AUTH_BASE}/ruang/${id}/`)
    return getResponseData(response)
  },

  getRuangMembers: async (id) => {
    const response = await api.get(`${AUTH_BASE}/ruang/${id}/members/`)
    return getResponseData(response)
  },

  joinRuang: async (kode_join) => {
    const response = await api.post(`${AUTH_BASE}/ruang/join/`, { kode_join })
    return response.data
  }
}

export default authService
