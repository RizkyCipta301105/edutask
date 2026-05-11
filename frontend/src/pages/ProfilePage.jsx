import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Lock, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useForm } from '../hooks/useForm'
import InputField from '../components/common/InputField'
import Navbar from '../components/common/Navbar'
import authService from '../services/authService'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  const profileForm = useForm({ nama_lengkap: user?.nama_lengkap || '' })
  const onUpdateProfile = profileForm.handleSubmit(async (vals) => {
    try {
      const updated = await authService.updateProfile(vals)
      updateUser(updated)
      toast.success('Profil berhasil diperbarui.')
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) profileForm.setApiErrors(apiErrors)
      else toast.error('Gagal memperbarui profil.')
    }
  })

  const passForm = useForm({ password_lama: '', password_baru: '', password_baru_confirm: '' })
  const onChangePass = passForm.handleSubmit(async (vals) => {
    try {
      await authService.changePassword(vals)
      toast.success('Password berhasil diubah. Silakan login kembali.')
      await logout()
      navigate('/login')
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) passForm.setApiErrors(apiErrors)
      else toast.error('Gagal mengubah password.')
    }
  })

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10 lg:pl-[18rem] lg:pt-28">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="text-primary-400 hover:text-primary-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-display font-bold text-primary-800">Profil Saya</h1>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              {user?.foto_profil_url
                ? <img src={user.foto_profil_url} alt="Foto profil" className="w-full h-full rounded-full object-cover" />
                : <User size={40} className="text-primary-400" />
              }
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow hover:bg-primary-700 transition-colors">
              <Camera size={14} />
            </button>
          </div>
          <p className="mt-3 font-display font-bold text-primary-800 text-lg">{user?.nama_lengkap}</p>
          <p className="text-primary-400 text-sm">{user?.email}</p>
          <span className="mt-1 text-xs bg-primary-100 text-primary-600 font-medium px-3 py-0.5 rounded-full capitalize">{user?.role || user?.tipe_akun}</span>
        </div>

        <div className="flex gap-1 bg-primary-50 p-1 rounded-xl mb-6">
          {[{ key: 'profile', label: 'Informasi Profil', icon: User }, { key: 'password', label: 'Ganti Password', icon: Lock }].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-150
                ${tab === key ? 'bg-white text-primary-700 shadow-sm' : 'text-primary-400 hover:text-primary-600'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card p-6 animate-fade-in">
            <form onSubmit={onUpdateProfile} className="flex flex-col gap-5">
              <InputField label="Nama Lengkap" name="nama_lengkap" value={profileForm.values.nama_lengkap}
                onChange={profileForm.handleChange} error={profileForm.errors.nama_lengkap} icon={User} required />
              <InputField label="Email" name="email" value={user?.email || ''} disabled hint="Email tidak dapat diubah." />
              <button type="submit" disabled={profileForm.loading} className="btn-primary flex items-center justify-center gap-2">
                {profileForm.loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={16} /> Simpan Perubahan</>}
              </button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="card p-6 animate-fade-in">
            <form onSubmit={onChangePass} className="flex flex-col gap-5">
              <InputField label="Password Lama" name="password_lama" type="password" value={passForm.values.password_lama} onChange={passForm.handleChange} error={passForm.errors.password_lama} icon={Lock} required />
              <InputField label="Password Baru" name="password_baru" type="password" value={passForm.values.password_baru} onChange={passForm.handleChange} error={passForm.errors.password_baru} icon={Lock} hint="Minimal 8 karakter" required />
              <InputField label="Konfirmasi Password Baru" name="password_baru_confirm" type="password" value={passForm.values.password_baru_confirm} onChange={passForm.handleChange} error={passForm.errors.password_baru_confirm} icon={Lock} required />
              <button type="submit" disabled={passForm.loading} className="btn-primary flex items-center justify-center gap-2">
                {passForm.loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lock size={16} /> Ubah Password</>}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
