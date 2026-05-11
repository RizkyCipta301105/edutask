/**
 * EduTask API Service
 * Axios instance dengan JWT auto-refresh interceptor
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Axios instance utama ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ─── Request interceptor: inject access token ke setiap request ──────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor: auto-refresh token jika 401 ───────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Jika 401 dan bukan dari endpoint refresh/login
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/token/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Antrekan request yang gagal saat sedang refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const newAccessToken = response.data.data.access
        localStorage.setItem('access_token', newAccessToken)
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ─── Helper ───────────────────────────────────────────────────────────────────
export const saveTokens = ({ access, refresh }) => {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export const getAccessToken = () => localStorage.getItem('access_token')

export default api
