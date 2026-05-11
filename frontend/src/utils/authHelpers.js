export function getRoleDashboardPath(role) {
  if (role === 'dosen') return '/dashboard/dosen'
  if (role === 'umum') return '/dashboard/umum'
  return '/dashboard/mahasiswa'
}

export function normalizeUserRole(user) {
  return user?.role || (user?.tipe_akun === 'pens' ? 'mahasiswa' : 'umum')
}
