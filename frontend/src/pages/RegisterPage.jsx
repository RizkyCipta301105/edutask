import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { GraduationCap, Mail, User, Lock, Lightbulb } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'
import { getApiErrorMessage } from '../utils/apiErrors'

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
        <div className="w-full max-w-xl">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
            <p className="mt-2 text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}

export default function RegisterPage({ type = 'mahasiswa' }) {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [values, setValues] = useState({ nama_lengkap: '', email: '', password: '' })

  const config = useMemo(() => {
    if (type === 'umum') return {
      title: 'Create an Account',
      subtitle: 'Manage tasks efficiently with EduTask',
      button: 'Register Account',
      terms: 'I accept the Terms and Conditions',
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
    if (type === 'mahasiswa' && !values.email.endsWith('@student.pens.ac.id') && !values.email.endsWith('@pens.ac.id')) {
      toast.error('Email mahasiswa harus menggunakan domain kampus PENS.')
      return
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
          <AuthInput label="Full Name" name="nama_lengkap" value={values.nama_lengkap} onChange={handleChange} placeholder="Enter your full name" icon={User} autoComplete="name" />
          <AuthInput label="Email Address" name="email" type="email" value={values.email} onChange={handleChange} placeholder="example@email.com" icon={Mail} autoComplete="email" />
          <AuthInput label="Password" name="password" type="password" value={values.password} onChange={handleChange} placeholder="Min. 8 characters" icon={Lock} autoComplete="new-password" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            I accept the <span className="text-[#B8842A]">Terms and Conditions</span>
          </label>
          <button className="auth-primary-button" disabled={loading}>{loading ? 'Memproses...' : config.button}</button>

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
              text="signup_with"
            />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-[#B8842A]">Log in here</Link>
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

        <label className="flex items-start gap-3 text-sm text-slate-600 sm:items-center">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          {config.terms}
        </label>

        <button className="auth-primary-button" disabled={loading}>
          <GraduationCap size={18} />
          {loading ? 'Memproses...' : config.button}
        </button>

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
            text="signup_with"
          />
        </div>

        <p className="text-center text-sm text-slate-500">
          Sudah punya akun? <Link to="/login" className="font-semibold text-[#B8842A]">Masuk di sini</Link>
        </p>
      </form>
    </RegisterShell>
  )
}
