import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { updateUser, isAuthenticated } = useAuth()
  
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('Memverifikasi email Anda...')
  const hasAttempted = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token verifikasi tidak ditemukan.')
      return
    }

    if (hasAttempted.current) return
    hasAttempted.current = true

    const verifyToken = async () => {
      try {
        const res = await api.post('/api/auth/verify-email/', { token })
        setStatus('success')
        setMessage(res.data.message || 'Email berhasil diverifikasi!')
        if (isAuthenticated) {
          updateUser({ is_email_verified: true })
        }
        setTimeout(() => navigate(isAuthenticated ? '/dashboard' : '/login'), 3000)
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Gagal memverifikasi email.')
      }
    }

    verifyToken()
  }, [token, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && <Loader2 className="h-16 w-16 animate-spin text-[#B8842A]" />}
          {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
          {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
          
          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            {status === 'loading' ? 'Verifikasi Email' : status === 'success' ? 'Verifikasi Berhasil' : 'Verifikasi Gagal'}
          </h2>
          <p className="mt-2 text-slate-500">{message}</p>
          
          {status !== 'loading' && (
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="mt-8 w-full rounded-xl bg-[#4B3A2F] px-4 py-3 font-semibold text-white transition hover:bg-[#3d3025]"
            >
              {isAuthenticated ? 'Kembali ke Dashboard' : 'Kembali ke Login'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
