import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole } from '../../utils/authHelpers'

/** Hanya bisa diakses jika BELUM login (guest) */
export default function GuestRoute() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to={getRoleDashboardPath(normalizeUserRole(user))} replace /> : <Outlet />
}
