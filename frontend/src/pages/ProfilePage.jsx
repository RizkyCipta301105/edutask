import { useAuth } from '../context/AuthContext'
import { normalizeUserRole } from '../utils/authHelpers'
import AppLayout from '../components/common/AppLayout'
import SettingsView from '../components/dashboard/SettingsView'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const role = normalizeUserRole(user)

  return (
    <AppLayout>
      <div className="p-8">
        
        {/* Header Section */}
        <div className="mb-8 border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Akun & Profil</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola data diri, keamanan kata sandi, preferensi notifikasi, dan sesi perangkat Anda</p>
        </div>

        {/* Premium Settings Content */}
        <div className="animate-fade-in">
          <SettingsView 
            onLogout={logout} 
            user={user} 
            roleView={role} 
          />
        </div>

      </div>
    </AppLayout>
  )
}
