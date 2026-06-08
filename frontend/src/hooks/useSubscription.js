import { useState, useEffect, useCallback } from 'react'
import paymentService from '../services/paymentService'
import { useAuth } from '../context/AuthContext'

/**
 * Hook untuk mengambil dan mengecek subscription user.
 *
 * Usage:
 *   const { subscription, features, isPro, isTeam, loading } = useSubscription()
 *
 * Features object:
 *   features.kanban          → boolean
 *   features.ruang_edukasi   → boolean
 *   features.inbox           → boolean
 *   features.broadcast       → boolean
 *   features.analytics       → boolean
 *   features.export_csv      → boolean
 *   features.multiple_ruang  → boolean
 *   features.max_members     → number
 */

const DEFAULT_FEATURES = {
  kanban: true,
  calendar: true,
  notifications: true,
  // Ruang Edukasi tidak ada di sini — aksesnya ditentukan oleh role user, bukan plan
  inbox: false,
  broadcast: false,
  analytics: false,
  export_csv: false,
  // Workspace proyek limits (FREE defaults)
  max_workspace: 1,
  max_members_per_workspace: 3,
}

export function useSubscription() {
  const { isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    try {
      const data = await paymentService.getSubscription()
      setSubscription(data)
    } catch {
      setSubscription(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const features = subscription?.features ?? DEFAULT_FEATURES
  const plan = subscription?.plan ?? 'free'
  const isActive = subscription?.is_active ?? false

  // Helper: apakah user bisa akses Ruang Edukasi (cek di komponen pakai user.role)
  // isPro / isTeam hanya untuk fitur inbox, broadcast, analytics, workspace proyek extra

  return {
    subscription,
    features,
    plan,
    isActive,
    isFree: plan === 'free' || !isActive,
    isPro: (plan === 'pro' || plan === 'team') && isActive,
    isTeam: plan === 'team' && isActive,
    // Batas workspace proyek (dari features yang datang dari backend)
    maxWorkspace: features.max_workspace,                         // null = unlimited
    maxMembersPerWorkspace: features.max_members_per_workspace,
    loading,
    refetch: fetchSubscription,
  }
}
