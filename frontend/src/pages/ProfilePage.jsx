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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-4 border-black pb-6 gap-4 bg-[#fbcfe8] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h1 className="text-4xl font-black text-black uppercase">Pengaturan Akun & Profil</h1>
            <p className="font-bold text-black border-2 border-black bg-white inline-block px-3 py-1 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Kelola data diri, keamanan kata sandi, preferensi notifikasi, dan sesi perangkat Anda</p>
          </div>
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
