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
      <div className="w-16 h-16 rounded-xl border-4 border-black bg-yellow-300 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Lock size={28} className="text-black stroke-[3px]" />
      </div>
      <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight mb-2">Fitur Terkunci</h3>
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-6 max-w-xs">
        Fitur ini tersedia untuk paket Pro atau Team. Upgrade sekarang untuk mengakses.
      </p>
      <Link
        to="/checkout?plan=pro"
        className="bg-green-400 border-4 border-black text-black text-lg font-black uppercase px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        Upgrade ke Pro
      </Link>
    </div>
  )
}
