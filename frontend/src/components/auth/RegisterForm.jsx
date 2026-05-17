import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import InputField from '../common/InputField'
import PasswordToggleButton from '../common/PasswordToggleButton'
import SubmitButton from '../common/SubmitButton'

const TIPE_AKUN_OPTIONS = [
  { value: 'umum',  label: 'Pengguna Umum',  desc: 'Tanpa afiliasi institusi' },
  { value: 'pens',  label: 'Mahasiswa ',  desc: 'Akun institusi  (sinkronisasi kelas)' },
  { value: 'gmail', label: 'Gmail (OAuth)',   desc: 'Login via akun Google' },
]

export default function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { values, errors, loading, handleChange, handleSubmit, setApiErrors } = useForm({
    nama_lengkap: '',
    email: '',
    tipe_akun: 'umum',
    password: '',
    password_confirm: '',
  })

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await register(vals)
      toast.success('Akun berhasil dibuat! Selamat datang di EduTask.')
      navigate('/dashboard')
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      const msg = err.response?.data?.message || 'Registrasi gagal.'
      if (apiErrors) setApiErrors(apiErrors)
      else toast.error(msg)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 animate-fade-up">

      {/* Nama Lengkap */}
      <InputField
        label="Nama Lengkap"
        name="nama_lengkap"
        value={values.nama_lengkap}
        onChange={handleChange}
        error={errors.nama_lengkap}
        placeholder="Masukkan nama anda"
        icon={User}
        required
      />

      {/* Email */}
      <InputField
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="nama@email.com"
        icon={Mail}
        autoComplete="email"
        required
      />

      {/* Tipe Akun */}
      <div className="flex flex-col gap-1.5">
        <label className="label">
          Tipe Akun <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {TIPE_AKUN_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150
                ${values.tipe_akun === opt.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-primary-100 bg-white hover:border-primary-300'
                }`}
            >
              <input
                type="radio"
                name="tipe_akun"
                value={opt.value}
                checked={values.tipe_akun === opt.value}
                onChange={handleChange}
                className="mt-0.5 accent-primary-600"
              />
              <div>
                <p className="text-sm font-semibold text-primary-800">{opt.label}</p>
                <p className="text-xs text-primary-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.tipe_akun && <p className="error-text">{errors.tipe_akun}</p>}
      </div>

      {/* Password */}
      <InputField
        label="Password"
        name="password"
        type={showPass ? 'text' : 'password'}
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Minimal 8 karakter"
        icon={Lock}
        autoComplete="new-password"
        hint="Gunakan kombinasi huruf, angka, dan simbol"
        required
        rightElement={
          <PasswordToggleButton visible={showPass} onToggle={() => setShowPass((v) => !v)} />
        }
      />

      {/* Konfirmasi Password */}
      <InputField
        label="Konfirmasi Password"
        name="password_confirm"
        type={showConfirm ? 'text' : 'password'}
        value={values.password_confirm}
        onChange={handleChange}
        error={errors.password_confirm}
        placeholder="Ulangi password"
        icon={Lock}
        autoComplete="new-password"
        required
        rightElement={
          <PasswordToggleButton visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
        }
      />

      <SubmitButton loading={loading}>
        <UserPlus size={17} />
        Buat Akun EduTask
      </SubmitButton>

      <p className="text-center text-sm text-primary-500">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-primary-700 font-semibold hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  )
}
