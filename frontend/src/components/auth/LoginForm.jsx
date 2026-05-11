import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import InputField from '../common/InputField'

export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  const { values, errors, loading, handleChange, handleSubmit, setApiErrors } = useForm({
    email: '',
    password: '',
  })

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await login(vals)
      toast.success('Selamat datang kembali!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau password salah.'
      const apiErrors = err.response?.data?.errors
      if (apiErrors) setApiErrors(apiErrors)
      else toast.error(msg)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 animate-fade-up">
      <InputField
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="nama@email.com"
        icon={Mail}
        required
      />

      <InputField
        label="Password"
        name="password"
        type={showPass ? 'text' : 'password'}
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Masukkan password"
        icon={Lock}
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="text-primary-400 hover:text-primary-600 transition-colors"
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        }
      />

      {/* Global error */}
      {errors.non_field_errors && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {errors.non_field_errors}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 mt-1">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <LogIn size={17} />
            Masuk ke EduTask
          </>
        )}
      </button>

      <p className="text-center text-sm text-primary-500">
        Belum punya akun?{' '}
        <Link to="/register" className="text-primary-700 font-semibold hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </form>
  )
}
