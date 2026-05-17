import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import FormError from '../common/FormError'
import InputField from '../common/InputField'
import PasswordToggleButton from '../common/PasswordToggleButton'
import SubmitButton from '../common/SubmitButton'

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
        autoComplete="email"
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
        autoComplete="current-password"
        required
        rightElement={
          <PasswordToggleButton visible={showPass} onToggle={() => setShowPass((v) => !v)} />
        }
      />

      <FormError>{errors.non_field_errors}</FormError>

      <SubmitButton loading={loading}>
        <LogIn size={17} />
        Masuk ke EduTask
      </SubmitButton>

      <p className="text-center text-sm text-primary-500">
        Belum punya akun?{' '}
        <Link to="/register" className="text-primary-700 font-semibold hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </form>
  )
}
