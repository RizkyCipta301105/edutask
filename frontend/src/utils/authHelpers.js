export const AUTH_RETURN_PATH_KEY = 'auth_return_to'

export const USER_ROLES = ['mahasiswa', 'dosen', 'umum']

export function getRoleDashboardPath(role) {
  if (role === 'dosen') return '/dashboard/dosen'
  if (role === 'umum') return '/dashboard/umum'
  return '/dashboard/mahasiswa'
}

export function normalizeUserRole(user) {
  if (!user) return null
  if (user.role && USER_ROLES.includes(user.role)) return user.role
  if (user.tipe_akun === 'pens') return 'mahasiswa'
  return 'umum'
}

export function userHasRole(user, allowedRoles) {
  if (!allowedRoles?.length) return true
  const role = normalizeUserRole(user)
  return allowedRoles.includes(role)
}

export function saveAuthReturnPath(path) {
  if (!path || path === '/login' || path.startsWith('/login') || path.startsWith('/register')) {
    return
  }
  sessionStorage.setItem(AUTH_RETURN_PATH_KEY, path)
}

export function consumeAuthReturnPath(fallbackPath) {
  const saved = sessionStorage.getItem(AUTH_RETURN_PATH_KEY)
  sessionStorage.removeItem(AUTH_RETURN_PATH_KEY)
  return saved || fallbackPath
}

export function redirectToLogin(returnPath) {
  if (returnPath) saveAuthReturnPath(returnPath)
  window.location.replace('/login')
}
