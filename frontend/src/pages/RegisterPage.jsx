import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { GraduationCap, Mail, User, Lock, Lightbulb } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'
import { getApiErrorMessage } from '../utils/apiErrors'
import PageTransition from '../components/common/PageTransition'

function AuthInput({ label, name, value, onChange, placeholder, type = 'text', icon: Icon, required = true, autoComplete }) {
  return (
    <label className="block">
      <span className="auth-label">{label}</span>
      <span className="relative mt-2 block">
        {Icon && <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`auth-input ${Icon ? 'pl-11' : ''}`}
        />
      </span>
    </label>
  )
}

function RegisterShell({ children, title, subtitle }) {
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
        <div className="w-full max-w-xl">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-block -rotate-2 border-2 border-black bg-pink-300 px-4 py-1 text-sm font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              GABUNG EDUTASK
            </div>
            <h2 className="text-4xl font-black uppercase text-black">{title}</h2>
            <p className="mt-2 font-bold text-gray-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
    </PageTransition>
  )
}

export default function RegisterPage({ type = 'mahasiswa' }) {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [values, setValues] = useState({ nama_lengkap: '', email: '', password: '' })

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  const config = useMemo(() => {
    if (type === 'umum') return {
      title: 'Buat Akun Baru',
      subtitle: 'Kelola tugasmu secara efisien dengan EduTask',
      button: 'Daftar Akun',
      terms: 'Saya setuju dengan Syarat dan Ketentuan EduTask',
      register: auth.registerUmum,
      success: 'Akun umum berhasil dibuat.',
    }
    if (type === 'dosen') return {
      title: 'Registrasi Dosen',
      subtitle: 'Buat akun dosen untuk mengelola jadwal mengajar dan tugas',
      button: 'Daftar Akun Dosen',
      terms: 'Saya setuju dengan syarat dan ketentuan EduTask',
      register: auth.registerDosen,
      success: 'Akun dosen berhasil dibuat.',
    }
    return {
      title: 'Registrasi Mahasiswa',
      subtitle: 'Gunakan akun kampusmu untuk sinkronisasi EduTask',
      button: 'Daftar Akun Mahasiswa',
      terms: 'Saya setuju dengan syarat dan ketentuan EduTask',
      register: auth.registerMahasiswa,
      success: 'Akun mahasiswa berhasil dibuat.',
    }
  }, [type, auth])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accepted) { toast.error('Syarat dan ketentuan harus disetujui.'); return }
    if ((type === 'mahasiswa' || type === 'dosen') && values.email) {
      const emailClean = values.email.trim().toLowerCase()
      const domain = emailClean.split('@').pop()
      if (domain !== 'pens.ac.id' && !domain.endsWith('.pens.ac.id')) {
        toast.error(`Email ${type} harus menggunakan domain kampus (*.pens.ac.id).`)
        return
      }
    }
    try {
      setLoading(true)
      const user = await config.register({ nama_lengkap: values.nama_lengkap, email: values.email, password: values.password })
      toast.success(config.success)
      navigate(getRoleDashboardPath(normalizeUserRole(user)), { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registrasi gagal.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const user = await auth.googleLogin({ id_token: credentialResponse.credential, role: type })
      toast.success(config.success)
      navigate(getRoleDashboardPath(normalizeUserRole(user)), { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal masuk dengan Google.'))
    } finally {
      setLoading(false)
    }
  }

  // ── Form Umum ──────────────────────────────────────────────────────────────
  if (type === 'umum') {
    return (
      <RegisterShell title={config.title} subtitle={config.subtitle}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput label="Nama Lengkap" name="nama_lengkap" value={values.nama_lengkap} onChange={handleChange} placeholder="Masukkan nama lengkapmu" icon={User} autoComplete="name" />
          <AuthInput label="Alamat Email" name="email" type="email" value={values.email} onChange={handleChange} placeholder="contoh@email.com" icon={Mail} autoComplete="email" />
          <AuthInput label="Password" name="password" type="password" value={values.password} onChange={handleChange} placeholder="Minimal 8 karakter" icon={Lock} autoComplete="new-password" />
          <label className="flex cursor-pointer items-center gap-2 font-bold text-black text-sm">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-5 w-5 rounded-none border-2 border-black text-black focus:ring-0" />
            Saya setuju dengan <span className="text-[#ea580c] hover:underline hover:decoration-4 hover:underline-offset-4">Syarat dan Ketentuan</span>
          </label>
          <button className="auth-primary-button" disabled={loading}>{loading ? 'Memproses...' : config.button}</button>

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
              text="signup_with"
            />
          </div>

          <p className="text-center text-sm font-bold text-gray-600">
            Sudah punya akun? <Link to="/login" className="font-black text-[#ea580c] hover:underline hover:decoration-4 hover:underline-offset-4">Masuk di sini</Link>
          </p>
        </form>
      </RegisterShell>
    )
  }

  // ── Form Mahasiswa / Dosen ─────────────────────────────────────────────────
  return (
    <RegisterShell title={config.title} subtitle={config.subtitle}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-5 md:grid-cols-1">
          <AuthInput label="Nama Lengkap" name="nama_lengkap" value={values.nama_lengkap} onChange={handleChange} placeholder="Masukkan nama lengkap anda" icon={User} autoComplete="name" />
          <AuthInput label={type === 'dosen' ? 'Email Dosen' : 'Email Kampus'} name="email" type="email" value={values.email} onChange={handleChange} placeholder={type === 'dosen' ? 'Masukkan email dosen' : 'Masukkan Email kampus'} icon={Mail} autoComplete="email" />
          <AuthInput label="Password" name="password" type="password" value={values.password} onChange={handleChange} placeholder="Masukkan Password anda" icon={Lock} autoComplete="new-password" />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm font-bold text-black sm:items-center">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-5 w-5 rounded-none border-2 border-black text-black focus:ring-0" />
          {config.terms}
        </label>

        <button className="auth-primary-button" disabled={loading}>
          <GraduationCap size={18} />
          {loading ? 'Memproses...' : config.button}
        </button>

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
            text="signup_with"
          />
        </div>

        <p className="text-center text-sm font-bold text-gray-600">
          Sudah punya akun? <Link to="/login" className="font-black text-[#ea580c] hover:underline hover:decoration-4 hover:underline-offset-4">Masuk di sini</Link>
        </p>
      </form>
    </RegisterShell>
  )
}
