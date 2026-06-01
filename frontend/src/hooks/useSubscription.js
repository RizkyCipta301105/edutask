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
  ruang_edukasi: false,
  inbox: false,
  broadcast: false,
  analytics: false,
  export_csv: false,
  multiple_ruang: false,
  max_members: 1,
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

  return {
    subscription,
    features,
    plan,
    isActive,
    isFree: plan === 'free' || !isActive,
    isPro: (plan === 'pro' || plan === 'team') && isActive,
    isTeam: plan === 'team' && isActive,
    loading,
    refetch: fetchSubscription,
  }
}
