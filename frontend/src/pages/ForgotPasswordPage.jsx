import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getApiErrorMessage } from '../utils/apiErrors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    try {
      setLoading(true)
      await api.post('/api/auth/forgot-password/', { email })
      setIsSent(true)
      toast.success('Instruksi reset password telah dikirim ke email Anda.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal mengirim instruksi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="w-12 h-12 bg-[#F3ECE1] rounded-xl flex items-center justify-center mb-6">
            <KeyRound className="text-[#B8842A]" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Lupa Password?</h2>
          <p className="mt-2 text-slate-500 text-sm">
            {isSent 
              ? "Kami telah mengirimkan instruksi reset password ke email Anda. Silakan cek kotak masuk atau folder spam."
              : "Jangan khawatir, kami akan mengirimkan instruksi untuk mereset password ke email Anda."}
          </p>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <label className="block">
                <span className="auth-label">Alamat Email</span>
                <span className="relative mt-2 block">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input pl-11"
                    placeholder="nama@email.com"
                    required
                  />
                </span>
              </label>

              <button type="submit" disabled={loading} className="auth-primary-button">
                {loading ? 'Mengirim...' : 'Kirim Instruksi Reset'}
              </button>
            </form>
          ) : (
            <div className="mt-8">
              <button 
                onClick={() => setIsSent(false)} 
                className="w-full text-sm font-semibold text-[#B8842A] hover:text-[#4B3A2F]"
              >
                Kirim ulang email
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition">
              <ArrowLeft size={16} className="mr-2" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
