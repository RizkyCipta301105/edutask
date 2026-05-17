/**
 * EduTask API Service
 * Axios instance dengan JWT auto-refresh interceptor
 */
import axios from 'axios'
import { redirectToLogin } from '../utils/authHelpers'

// Dev: use Vite proxy (/api → localhost:8000). Prod: use VITE_API_URL.
export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000')

const BASE_URL = API_BASE_URL
const REFRESH_ENDPOINT = '/api/auth/token/refresh/'

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
        redirectToLogin(window.location.pathname + window.location.search)
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${BASE_URL}${REFRESH_ENDPOINT}`, {
          refresh: refreshToken,
        })

        const newAccessToken = getResponseData(response)?.access
        if (!newAccessToken) {
          throw new Error('Token refresh tidak ditemukan dalam respons.')
        }
        localStorage.setItem('access_token', newAccessToken)
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        redirectToLogin(window.location.pathname + window.location.search)
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

export const getRefreshToken = () => localStorage.getItem('refresh_token')

export const getResponseData = (response) => response.data?.data

export const buildQueryParams = (filters = {}) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })

  return params
}

export default api
