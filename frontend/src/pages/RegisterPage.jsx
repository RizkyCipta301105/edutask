import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, Check, GraduationCap, Mail, User, CreditCard, BookOpen, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'
import { getApiErrorMessage } from '../utils/apiErrors'

const PRODI_OPTIONS = [
  'Teknologi Rekayasa Internet',
  'Teknik Informatika',
  'Teknik Elektro',
  'Sistem Informasi',
]

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

function RegisterShell({ children, title, subtitle, wide = false }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6 sm:py-10">
      <section className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-7 shadow-sm sm:px-10 sm:py-8 ${wide ? 'max-w-5xl' : 'max-w-xl'}`}>
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  )
}

export default function RegisterPage({ type = 'mahasiswa' }) {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [values, setValues] = useState({
    nama_lengkap: '',
    nrp: '',
    nip: '',
    email: '',
    password: '',
    prodi: PRODI_OPTIONS[0],
    mata_kuliah: '',
  })

  const config = useMemo(() => {
    if (type === 'umum') {
      return {
        title: 'Create an Account',
        subtitle: 'Manage tasks efficiently with EduTask',
        button: 'Register Account',
        terms: 'I accept the Terms and Conditions',
        register: auth.registerUmum,
        success: 'Akun umum berhasil dibuat.',
      }
    }
    if (type === 'dosen') {
      return {
        title: 'Registrasi Dosen',
        subtitle: 'Buat akun dosen untuk mengelola jadwal mengajar dan tugas',
        button: 'Daftar Akun Dosen',
        terms: 'Saya setuju dengan syarat dan ketentuan EduTask',
        register: auth.registerDosen,
        success: 'Akun dosen berhasil dibuat.',
      }
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!accepted) {
      toast.error('Syarat dan ketentuan harus disetujui.')
      return
    }
    if (type === 'mahasiswa' && !values.email.endsWith('@student.pens.ac.id') && !values.email.endsWith('@pens.ac.id')) {
      toast.error('Email mahasiswa harus menggunakan domain kampus PENS.')
      return
    }

    const payload = {
      nama_lengkap: values.nama_lengkap,
      email: values.email,
      password: values.password,
    }
    if (type === 'mahasiswa') {
      payload.nrp = values.nrp
      payload.prodi = values.prodi
    }
    if (type === 'dosen') {
      payload.nip = values.nip
      payload.mata_kuliah = values.mata_kuliah
    }

    try {
      setLoading(true)
      const user = await config.register(payload)
      toast.success(config.success)
      navigate(getRoleDashboardPath(normalizeUserRole(user)), { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registrasi gagal.'))
    } finally {
      setLoading(false)
    }
  }

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
          <p className="text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-[#B8842A]">Log in here</Link></p>
        </form>
      </RegisterShell>
    )
  }

  return (
    <RegisterShell title={config.title} subtitle={config.subtitle} wide>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-5 md:grid-cols-2">
          <AuthInput label="Nama Lengkap" name="nama_lengkap" value={values.nama_lengkap} onChange={handleChange} placeholder="Masukkan nama lengkap anda" icon={User} autoComplete="name" />
          <AuthInput label={type === 'dosen' ? 'NIP' : 'NRP / NIM'} name={type === 'dosen' ? 'nip' : 'nrp'} value={type === 'dosen' ? values.nip : values.nrp} onChange={handleChange} placeholder={type === 'dosen' ? 'Masukkan NIP anda' : 'Masukkan NRP Anda'} icon={CreditCard} />
          <AuthInput label={type === 'dosen' ? 'Email Dosen' : 'Email Kampus'} name="email" type="email" value={values.email} onChange={handleChange} placeholder={type === 'dosen' ? 'Masukkan email dosen' : 'Masukkan Email kampus'} icon={Mail} autoComplete="email" />
          <AuthInput label="Password" name="password" type="password" value={values.password} onChange={handleChange} placeholder="Masukkan Password anda" icon={Lock} autoComplete="new-password" />
        </div>

        {type === 'dosen' ? (
          <AuthInput label="Mata Kuliah" name="mata_kuliah" value={values.mata_kuliah} onChange={handleChange} placeholder="Contoh: Pemrograman Web" icon={BookOpen} />
        ) : (
          <div>
            <p className="auth-label mb-3">Pilih Program Studi (Geser untuk memilih)</p>
            <div className="flex gap-3 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {PRODI_OPTIONS.map(prodi => (
                <button
                  key={prodi}
                  type="button"
                  onClick={() => setValues(prev => ({ ...prev, prodi }))}
                  className={`whitespace-nowrap rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                    values.prodi === prodi
                      ? 'border-[#4B3A2F] bg-[#4B3A2F] text-white shadow-sm'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-[#4B3A2F] hover:text-[#4B3A2F]'
                  }`}
                >
                  {values.prodi === prodi && <Check size={15} className="mr-1 inline" />}
                  {prodi}
                </button>
              ))}
              <ArrowRight size={20} className="my-auto shrink-0 text-slate-400" />
            </div>
          </div>
        )}

        <label className="flex items-start gap-3 text-sm text-slate-600 sm:items-center">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          {config.terms}
        </label>

        <button className="auth-primary-button" disabled={loading}>
          <GraduationCap size={18} />
          {loading ? 'Memproses...' : config.button}
        </button>

        <p className="text-center text-sm text-slate-500">Sudah punya akun? <Link to="/login" className="font-semibold text-[#B8842A]">Masuk di sini</Link></p>
      </form>
    </RegisterShell>
  )
}
