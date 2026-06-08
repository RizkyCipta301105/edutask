import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Lightbulb, Mail, Lock, Loader2, PlayCircle, LogIn, Sparkles, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'
import { getApiErrorMessage } from '../utils/apiErrors'
import PageTransition from '../components/common/PageTransition'

export default function LoginPage({ mode = 'mahasiswa' }) {
  const { login, logout, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState({ email: '', password: '', remember: false })

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

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
    <PageTransition>
    <main className="min-h-screen bg-white md:grid md:grid-cols-2 selection:bg-yellow-300 selection:text-black">
      <section className="relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden border-b-4 border-black bg-[#0ea5e9] px-6 py-12 text-center text-black md:min-h-screen md:border-b-0 md:border-r-4 md:px-8">
        
        {/* Background elements */}
        <div className="absolute left-10 top-10 h-24 w-24 rounded-full border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
        <div className="absolute bottom-10 right-10 h-32 w-32 rotate-12 border-4 border-black bg-green-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
        
        <div className="relative z-10 -rotate-2 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:rotate-0">
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <GraduationCap className="h-10 w-10 text-black" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">EduTask</h1>
          <p className="mt-4 border-2 border-black bg-yellow-300 px-3 py-1 text-sm font-bold uppercase tracking-widest text-black">
            Organize. Execute. Conquer.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-white px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-block -rotate-2 border-2 border-black bg-pink-300 px-4 py-1 text-sm font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {mode === 'dosen' ? 'PORTAL DOSEN' : 'AREA LOGIN'}
            </div>
            <h2 className="text-4xl font-black uppercase text-black">Selamat Datang!</h2>
            <p className="mt-2 font-bold text-gray-600">Bersiaplah untuk menyelesaikan tugasmu hari ini.</p>
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
              <label className="flex cursor-pointer items-center gap-2 font-bold text-black">
                <input
                  name="remember"
                  type="checkbox"
                  checked={values.remember}
                  onChange={handleChange}
                  className="h-5 w-5 rounded-none border-2 border-black text-black focus:ring-0"
                />
                Ingat saya
              </label>
              <Link 
                to="/forgot-password"
                className="font-black text-[#ea580c] hover:underline hover:decoration-4 hover:underline-offset-4"
              >
                Lupa Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="auth-primary-button">
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-5">
            <div className="h-[4px] flex-1 bg-black" />
            <span className="text-sm font-black uppercase tracking-wide text-black">ATAU</span>
            <div className="h-[4px] flex-1 bg-black" />
          </div>

          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Gagal terhubung dengan Google.')}
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <div className="my-10 flex items-center gap-5">
            <div className="h-[4px] flex-1 bg-black" />
            <span className="text-sm font-black uppercase tracking-wide text-black">ATAU DAFTAR</span>
            <div className="h-[4px] flex-1 bg-black" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link to="/register/mahasiswa" className="auth-outline-button">Mahasiswa</Link>
            <Link to="/register/umum" className="auth-outline-button">Umum</Link>
            <Link to="/register/dosen" className="auth-outline-button">Dosen</Link>
          </div>

          {mode !== 'dosen' && (
            <p className="mt-6 text-center text-sm font-bold text-gray-600">
              Login khusus dosen? <Link to="/login/dosen" className="font-black text-[#ea580c] hover:underline hover:decoration-4 hover:underline-offset-4">Masuk sebagai dosen</Link>
            </p>
          )}
        </div>
      </section>
    </main>
    </PageTransition>
  )
}
