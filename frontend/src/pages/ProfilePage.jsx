import { useAuth } from '../context/AuthContext'
import { normalizeUserRole } from '../utils/authHelpers'
import AppLayout from '../components/common/AppLayout'
import SettingsView from '../components/dashboard/SettingsView'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const role = normalizeUserRole(user)

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        
        {/* ── Neo-Brut Header ── */}
        <div className="relative mb-6 md:mb-8 overflow-hidden border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#B87FFF]">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 0, transparent 50%)', backgroundSize: '14px 14px' }} />
          
          <div className="relative z-10 p-4 md:p-6">
            <div className="inline-block bg-black text-white font-black text-xs uppercase px-3 py-1 mb-2 rotate-1">
               Pengaturan Akun
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase leading-none" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
              Profil & Pengaturan
            </h1>
            <div className="mt-2 border-[3px] border-black bg-white inline-block px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
              <span className="font-black text-black text-xs md:text-sm uppercase">Kelola data diri, keamanan & preferensi</span>
            </div>
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
