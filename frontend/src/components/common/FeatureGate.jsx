import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'

/**
 * Membatasi akses fitur berdasarkan plan subscription.
 *
 * Usage:
 *   <FeatureGate feature="ruang_edukasi">
 *     <RuangEdukasiList />
 *   </FeatureGate>
 *
 *   <FeatureGate feature="inbox" plan="pro">
 *     <Inbox />
 *   </FeatureGate>
 */
export default function FeatureGate({ feature, children, fallback }) {
  const { features, loading } = useSubscription()

  if (loading) return null

  const hasAccess = features[feature] === true

  if (hasAccess) return children

  if (fallback) return fallback

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <Lock size={20} className="text-amber-600" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-1">Fitur Terkunci</h3>
      <p className="text-sm text-slate-500 mb-4 max-w-xs">
        Fitur ini tersedia untuk paket Pro atau Team. Upgrade sekarang untuk mengakses.
      </p>
      <Link
        to="/checkout?plan=pro"
        className="bg-[#4B3A2F] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#3a2c23] transition-colors"
      >
        Upgrade ke Pro
      </Link>
    </div>
  )
}
