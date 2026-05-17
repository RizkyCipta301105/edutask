import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { saveAuthReturnPath } from '../../utils/authHelpers'

/** Hanya bisa diakses jika sudah login */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-primary-500 text-sm font-medium">Memuat EduTask...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    saveAuthReturnPath(location.pathname + location.search)
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
