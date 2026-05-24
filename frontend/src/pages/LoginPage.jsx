import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Lightbulb, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'
import { getApiErrorMessage } from '../utils/apiErrors'

export default function LoginPage({ mode = 'universal' }) {
  const { login, logout, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState({ email: '', password: '', remember: false })

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setValues(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      const user = await login({ email: values.email, password: values.password })
      const role = normalizeUserRole(user)
      if (mode === 'dosen' && role !== 'dosen') {
        await logout()
        toast.error('Akun ini bukan akun dosen.')
        return
      }
      toast.success('Selamat datang kembali!')
      const destination = getRoleDashboardPath(role)
      navigate(destination, { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Email atau password salah.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const user = await googleLogin({ id_token: credentialResponse.credential, role: mode === 'dosen' ? 'dosen' : 'umum' })
      const role = normalizeUserRole(user)
      if (mode === 'dosen' && role !== 'dosen') {
        await logout()
        toast.error('Akun ini bukan akun dosen.')
        return
      }
      toast.success('Berhasil masuk dengan Google!')
      const destination = getRoleDashboardPath(role)
      navigate(destination, { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal masuk dengan Google.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 md:grid md:grid-cols-2">
      <section className="flex min-h-[180px] flex-col items-center justify-center bg-[#4B3A2F] px-6 py-8 text-center text-white sm:min-h-[240px] md:min-h-screen md:px-8 md:py-12">
        <div className="relative mb-4 flex h-20 w-20 items-center justify-center sm:mb-6 sm:h-28 sm:w-28 md:mb-8 md:h-32 md:w-32">
          <Lightbulb className="h-full w-full text-white" strokeWidth={1.8} />
          <GraduationCap className="absolute -top-3 left-1/2 h-[110%] w-[110%] -translate-x-1/2 text-[#D2A34E] md:-top-6" strokeWidth={1.9} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">Sumber Rezeki</h1>
        <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-[#D2A34E] sm:text-sm sm:tracking-[0.24em]">INNOVATE. AUTOMATE. ELEVATE.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#B8842A]">
              {mode === 'dosen' ? 'Portal Dosen' : 'EduTask'}
            </p>
            <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">Selamat Datang</h2>
            <p className="mt-2 text-slate-500">Masuk ke EduTask untuk mengelola project kamu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="auth-label">Alamat Email</span>
              <span className="relative mt-2 block">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  className="auth-input pl-11"
                  placeholder="nama@student.pens.ac.id"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="auth-label">Password</span>
              <span className="relative mt-2 block">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange}
                  className="auth-input pl-11 pr-12"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#4B3A2F]"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  name="remember"
                  type="checkbox"
                  checked={values.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-[#4B3A2F] focus:ring-[#D2A34E]"
                />
                Ingat saya
              </label>
              <Link 
                to="/forgot-password"
                className="font-semibold text-[#B8842A] transition hover:text-[#4B3A2F]"
              >
                Lupa Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="auth-primary-button">
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-5">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">ATAU</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Gagal terhubung dengan Google.')}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <div className="my-10 flex items-center gap-5">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">ATAU DAFTAR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link to="/register/mahasiswa" className="auth-outline-button">Mahasiswa</Link>
            <Link to="/register/umum" className="auth-outline-button">Umum</Link>
            <Link to="/register/dosen" className="auth-outline-button">Dosen</Link>
          </div>

          {mode !== 'dosen' && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Login khusus dosen? <Link to="/login/dosen" className="font-semibold text-[#B8842A] hover:text-[#4B3A2F]">Masuk sebagai dosen</Link>
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
