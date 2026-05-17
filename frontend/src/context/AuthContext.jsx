/**
 * EduTask Auth Context
 * Global state untuk data user & status autentikasi
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'
import { getAccessToken, clearTokens } from '../services/api'
import { normalizeUserRole } from '../utils/authHelpers'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      return null
    }
    const profile = await authService.getProfile()
    setUser(profile)
    return profile
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      try {
        await loadProfile()
      } catch {
        clearTokens()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [loadProfile])

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser } = await authService.login(credentials)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const register = useCallback(async (data) => {
    const { user: newUser } = await authService.register(data)
    setUser(newUser)
    return newUser
  }, [])

  const registerUmum = useCallback(async (data) => {
    const { user: newUser } = await authService.registerUmum(data)
    setUser(newUser)
    return newUser
  }, [])

  const registerMahasiswa = useCallback(async (data) => {
    const { user: newUser } = await authService.registerMahasiswa(data)
    setUser(newUser)
    return newUser
  }, [])

  const registerDosen = useCallback(async (data) => {
    const { user: newUser } = await authService.registerDosen(data)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }))
  }, [])

  const userRole = normalizeUserRole(user)

  const value = {
    user,
    userRole,
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

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return ctx
}
