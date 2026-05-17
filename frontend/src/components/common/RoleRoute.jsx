import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole, userHasRole } from '../../utils/authHelpers'

/** Nested under ProtectedRoute — restricts routes to specific user roles. */
export default function RoleRoute({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  const role = normalizeUserRole(user)
  if (!userHasRole(user, allowedRoles)) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }

  return <Outlet />
}
