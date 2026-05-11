/**
 * EduTask Auth Context
 * Global state untuk data user & status autentikasi
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'
import { getAccessToken, clearTokens } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)  // cek session saat mount

  // Cek sesi yang masih aktif saat aplikasi pertama dibuka
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        clearTokens()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = useCallback(async (credentials) => {
    const { user } = await authService.login(credentials)
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (data) => {
    const { user } = await authService.register(data)
    setUser(user)
    return user
  }, [])

  const registerUmum = useCallback(async (data) => {
    const { user } = await authService.registerUmum(data)
    setUser(user)
    return user
  }, [])

  const registerMahasiswa = useCallback(async (data) => {
    const { user } = await authService.registerMahasiswa(data)
    setUser(user)
    return user
  }, [])

  const registerDosen = useCallback(async (data) => {
    const { user } = await authService.registerDosen(data)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }))
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    registerUmum,
    registerMahasiswa,
    registerDosen,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return ctx
}
