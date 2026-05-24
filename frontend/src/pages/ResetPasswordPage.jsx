import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getApiErrorMessage } from '../utils/apiErrors'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      toast.error('Token tidak valid atau tidak ditemukan.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok.')
      return
    }

    if (password.length < 8) {
      toast.error('Password minimal 8 karakter.')
      return
    }

    try {
      setLoading(true)
      await api.post('/api/auth/reset-password/', { token, new_password: password })
      setIsSuccess(true)
      toast.success('Password berhasil direset!')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal mereset password.'))
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <ShieldCheck className="mx-auto h-16 w-16 text-green-500 mb-6" />
          <h2 className="text-2xl font-bold text-slate-900">Password Diperbarui</h2>
          <p className="mt-2 text-slate-500">Password Anda telah berhasil direset. Silakan login kembali.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 w-full rounded-xl bg-[#4B3A2F] px-4 py-3 font-semibold text-white transition hover:bg-[#3d3025]"
          >
            Masuk Sekarang
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p className="mt-2 text-slate-500 text-sm">Masukkan password baru untuk akun Anda.</p>

          {!token ? (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
              Token reset password tidak valid. Silakan <Link to="/forgot-password" className="font-bold underline">minta link baru</Link>.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="auth-label">Password Baru</span>
                <span className="relative mt-2 block">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input pl-11 pr-12"
                    placeholder="Minimal 8 karakter"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#4B3A2F]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              <label className="block">
                <span className="auth-label">Konfirmasi Password Baru</span>
                <span className="relative mt-2 block">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input pl-11 pr-12"
                    placeholder="Ulangi password baru"
                    required
                  />
                </span>
              </label>

              <button type="submit" disabled={loading} className="auth-primary-button mt-6">
                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
