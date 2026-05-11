import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Lightbulb, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'

export default function LoginPage({ mode = 'universal' }) {
  const { login, logout } = useAuth()
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
      navigate(getRoleDashboardPath(role), { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email atau password salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 md:grid md:grid-cols-2">
      <section className="flex min-h-[300px] flex-col items-center justify-center bg-[#4B3A2F] px-8 py-12 text-center text-white md:min-h-screen">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
          <img
            src="/sumber-rezeki-logo.jpeg"
            alt="Sumber Rezeki"
            className="absolute inset-0 h-full w-full rounded-full object-cover opacity-0"
          />
          <Lightbulb size={84} className="text-white" strokeWidth={1.8} />
          <GraduationCap size={88} className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#D2A34E]" strokeWidth={1.9} />
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Sumber Rezeki</h1>
        <p className="mt-4 text-sm font-semibold tracking-[0.24em] text-[#D2A34E]">INNOVATE. AUTOMATE. ELEVATE.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#B8842A]">
              {mode === 'dosen' ? 'Portal Dosen' : 'EduTask'}
            </p>
            <h2 className="text-4xl font-bold text-slate-950">Selamat Datang</h2>
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

            <div className="flex items-center justify-between text-sm">
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
              <a href="#" className="font-semibold text-[#B8842A] transition hover:text-[#4B3A2F]">Lupa Password?</a>
            </div>

            <button type="submit" disabled={loading} className="auth-primary-button">
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

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
