import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import paymentService from '../services/paymentService'
import { useSubscription } from '../hooks/useSubscription'
import toast from 'react-hot-toast'
import {
  ArrowRight, Upload, CheckCircle, Loader, Lock,
  ShieldCheck, RotateCcw, Clock, XCircle, AlertCircle,
  RefreshCw, X, QrCode,
} from 'lucide-react'

const PLANS = {
  free: {
    name: 'FREE PLAN',
    price: 0,
    priceLabel: 'Rp 0',
    features: [
      'Kanban board pribadi',
      'Kalender & jadwal',
      'Notifikasi in-app',
      'Ruang Edukasi (mahasiswa & dosen)',
      '1 Workspace Proyek (maks. 3 anggota)',
    ],
  },
  pro: {
    name: 'PRO PLAN',
    price: 4999,
    priceLabel: 'Rp 4.999',
    features: [
      'Semua fitur Free',
      'Ruang Edukasi unlimited (mahasiswa & dosen)',
      '5 Workspace Proyek (maks. 7 anggota)',
      'Inbox & chat kolaborasi',
      'Broadcast tugas (Dosen)',
      'Laporan & analitik',
    ],
  },
  team: {
    name: 'TEAM PLAN',
    price: 9999,
    priceLabel: 'Rp 9.999',
    features: [
      'Semua fitur Pro',
      'Workspace Proyek unlimited (maks. 30 anggota)',
      'Export laporan CSV',
      'Prioritas support',
    ],
  },
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-300',
    label: 'Menunggu Pembayaran',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-300',
    label: 'Disetujui',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-300',
    label: 'Ditolak',
  },
}

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(expiredAt) {
  const [timeLeft, setTimeLeft] = useState(0)
  useEffect(() => {
    if (!expiredAt) return
    const calc = () => {
      // KlikQRIS returns local time (Asia/Jakarta) without timezone marker
      const expiresStr = expiredAt.includes('T') || expiredAt.endsWith('Z')
        ? expiredAt
        : expiredAt.replace(' ', 'T') + '+07:00'
      const diff = Math.max(0, Math.floor((new Date(expiresStr) - Date.now()) / 1000))
      setTimeLeft(diff)
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [expiredAt])
  return timeLeft
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { isPro, isTeam, refetch: refetchSubscription } = useSubscription()

  const planKey = searchParams.get('plan') || 'pro'
  const plan = PLANS[planKey] || PLANS.pro

  // State utama
  const [txData, setTxData] = useState(null)         // data dari KlikQRIS (order_id, qris_image, etc.)
  const [loadingInvoice, setLoadingInvoice] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [txStatus, setTxStatus] = useState(null)     // 'pending' | 'paid' | 'expired'
  const [showQRModal, setShowQRModal] = useState(false)

  // Riwayat pengajuan
  const [existingProofs, setExistingProofs] = useState([])
  const [proofsLoading, setProofsLoading] = useState(false)

  // Fallback manual upload
  const [showManualFallback, setShowManualFallback] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const fileRef = useRef()

  const timeLeft = useCountdown(txData?.expired_at)
  const timerMinutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const timerSeconds = String(timeLeft % 60).padStart(2, '0')

  // Ambil riwayat pengajuan
  useEffect(() => {
    if (!isAuthenticated || planKey === 'free') return
    setProofsLoading(true)
    paymentService.getPaymentProofs()
      .then(data => setExistingProofs(data || []))
      .catch(() => setExistingProofs([]))
      .finally(() => setProofsLoading(false))
  }, [isAuthenticated, planKey])

  const pendingProof = existingProofs.find(p => p.plan === planKey && p.status === 'pending')
  const approvedProof = existingProofs.find(p => p.plan === planKey && p.status === 'approved')

  // ─── Buat transaksi QRIS baru ────────────────────────────────────────────
  const handleCreateInvoice = async () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu.')
      navigate('/login')
      return
    }
    setLoadingInvoice(true)
    try {
      const data = await paymentService.createInvoice(planKey)
      setTxData(data)
      setTxStatus('pending')
      setShowQRModal(true)
      toast.success('QR Code berhasil dibuat!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat transaksi. Coba lagi.'
      toast.error(msg)
      setShowManualFallback(true)
    } finally {
      setLoadingInvoice(false)
    }
  }

  // ─── Buka modal QR dari invoice pending yang sudah ada ───────────────────
  const handleOpenExistingQR = async () => {
    if (!pendingProof?.order_id) return
    setLoadingInvoice(true)
    try {
      // Re-fetch data QRIS terbaru dari backend
      const data = await paymentService.createInvoice(planKey)
      setTxData(data)
      setTxStatus('pending')
      setShowQRModal(true)
    } catch {
      // Gunakan data dari proof yang ada saja
      setTxData({ order_id: pendingProof.order_id, amount: pendingProof.amount })
      setTxStatus('pending')
      setShowQRModal(true)
    } finally {
      setLoadingInvoice(false)
    }
  }

  // ─── Cek status transaksi ────────────────────────────────────────────────
  const handleCheckStatus = useCallback(async () => {
    const orderId = txData?.order_id || pendingProof?.order_id
    if (!orderId) return
    setCheckingStatus(true)
    try {
      const data = await paymentService.checkInvoice(orderId)
      setTxStatus(data.status)
      if (data.status === 'paid') {
        toast.success('Pembayaran berhasil! Subscription sedang diaktifkan...')
        await refetchSubscription()
        setShowQRModal(false)
        setTimeout(() => navigate('/dashboard'), 2000)
      } else if (data.status === 'expired') {
        toast.error('QR Code sudah kadaluarsa. Silakan buat transaksi baru.')
        setTxData(null)
        setTxStatus(null)
        setShowQRModal(false)
      }
    } catch {
      toast.error('Gagal mengecek status. Coba lagi.')
    } finally {
      setCheckingStatus(false)
    }
  }, [txData, pendingProof, refetchSubscription, navigate])

  // Polling otomatis setiap 5 detik saat transaksi pending
  useEffect(() => {
    if (txStatus !== 'pending') return
    const orderId = txData?.order_id || pendingProof?.order_id
    if (!orderId) return
    const interval = setInterval(handleCheckStatus, 5000)
    return () => clearInterval(interval)
  }, [txStatus, txData, pendingProof, handleCheckStatus])

  // ─── Polling otomatis setiap 5 detik saat transaksi pending ─────────────────
  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleManualSubmit = async () => {
    if (!file) { toast.error('Upload bukti pembayaran terlebih dahulu.'); return }
    const formData = new FormData()
    formData.append('proof', file)
    formData.append('plan', planKey)
    try {
      setLoadingUpload(true)
      await paymentService.submitProof(formData)
      setUploadDone(true)
      toast.success('Bukti pembayaran berhasil dikirim!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim bukti.')
    } finally {
      setLoadingUpload(false)
    }
  }

  const alreadyUpgraded = (planKey === 'pro' && (isPro || isTeam)) || (planKey === 'team' && isTeam)

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f5f0] font-sans">

      {/* Navbar */}
      <header className="bg-white border-b-2 border-black px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="text-2xl font-black tracking-tighter text-black uppercase leading-none">
          EDUTASK
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated
            ? <span className="text-xs text-gray-500 font-mono">{user?.email}</span>
            : <Link to="/login" className="text-xs font-bold uppercase hover:underline">Login</Link>
          }
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-5xl font-black uppercase tracking-tight text-black mb-2">CHECKOUT</h1>
          <p className="text-gray-500 text-sm max-w-md">
            Bayar dengan QRIS dinamis via KlikQRIS. Subscription aktif otomatis setelah pembayaran berhasil.
          </p>
        </div>

        {/* Banner: sudah aktif */}
        {alreadyUpgraded && (
          <div className="mb-6 border-2 border-green-400 bg-green-50 p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black uppercase">Paket {planKey.toUpperCase()} Sudah Aktif</p>
              <p className="text-xs text-gray-600 mt-1">
                Anda sudah menggunakan paket ini. Kembali ke dashboard untuk menggunakan semua fitur.
              </p>
              <button onClick={() => navigate('/dashboard')} className="mt-2 text-xs font-black uppercase underline">
                Kembali ke Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Banner: ada invoice pending */}
        {!alreadyUpgraded && pendingProof && !txData && (
          <div className="mb-6 border-2 border-yellow-400 bg-yellow-50 p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black uppercase">Ada Transaksi yang Belum Dibayar</p>
              <p className="text-xs text-gray-600 mt-1">
                Order <code className="bg-yellow-100 px-1 font-mono">{pendingProof.order_id}</code> masih aktif.
              </p>
              <button
                onClick={handleOpenExistingQR}
                disabled={loadingInvoice}
                className="mt-2 text-xs font-black uppercase underline text-yellow-700"
              >
                {loadingInvoice ? 'Memuat...' : 'Lanjutkan Bayar →'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

          {/* Left — Plan Info */}
          <div className="bg-white border-r-0 md:border-r-2 border-black p-8 relative">


            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">You're choosing:</p>
            <h2 className="text-2xl font-black text-[#FF4D00] uppercase mb-4">{plan.name}</h2>
            <div className="text-5xl font-black text-black mb-1">{plan.priceLabel}</div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">/ Bulan</p>
            <div className="w-full h-[2px] bg-black mb-6" />

            <ul className="space-y-3 mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                  <span className="w-4 h-4 border-2 border-[#FF4D00] bg-[#FF4D00]/10 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 bg-[#FF4D00] block" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {planKey !== 'free' && (
              <div className="border-2 border-black p-4 bg-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Powered by
                </p>
                <div className="flex items-center gap-2">
                  <QrCode size={20} className="text-[#FF4D00]" />
                  <span className="text-lg font-black text-black">KlikQRIS</span>
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 border border-green-300">
                    QRIS DINAMIS
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  Pembayaran diproses via KlikQRIS Payment Gateway. Subscription aktif otomatis setelah pembayaran berhasil.
                </p>
              </div>
            )}

            <div className="border-2 border-black p-4 flex items-center justify-between bg-gray-50 mt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Due Today</p>
                <p className="text-[9px] text-gray-400 mt-0.5">*Belum termasuk kode unik</p>
              </div>
              <p className="text-xl font-black text-black">{plan.priceLabel}</p>
            </div>
          </div>

          {/* Right — Payment Flow */}
          <div className="bg-white p-8">
            <h3 className="text-xl font-black uppercase tracking-tight border-b-2 border-black pb-4 mb-6">
              {planKey === 'free' ? 'Konfirmasi' : 'Pembayaran'}
            </h3>

            {planKey === 'free' ? (
              /* Free plan */
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Paket Free tidak memerlukan pembayaran.</p>
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                  className="w-full bg-black text-white font-black py-4 uppercase tracking-widest hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  Mulai Sekarang <ArrowRight size={16} />
                </button>
              </div>

            ) : txStatus === 'paid' ? (
              /* Paid */
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle size={48} className="text-green-500" />
                <h4 className="text-xl font-black uppercase">Pembayaran Berhasil!</h4>
                <p className="text-sm text-gray-500 max-w-xs">
                  Subscription {planKey.toUpperCase()} Anda sedang diaktifkan. Anda akan diarahkan ke dashboard.
                </p>
                <button onClick={() => navigate('/dashboard')} className="mt-4 bg-[#FF4D00] text-white font-black px-6 py-3 uppercase tracking-widest hover:bg-[#e04400] transition-colors border-2 border-black">
                  Buka Dashboard →
                </button>
              </div>

            ) : txData && txStatus === 'pending' ? (
              /* Transaksi sudah dibuat — tunggu pembayaran */
              <div className="space-y-5">
                <div className="border-2 border-yellow-400 bg-yellow-50 p-4 text-center">
                  <Clock size={28} className="mx-auto text-yellow-600 mb-2" />
                  <p className="text-sm font-black uppercase">Menunggu Pembayaran</p>
                  <p className="text-xs text-gray-600 mt-1 font-mono">{txData.order_id}</p>
                  {timeLeft > 0 && (
                    <p className={`text-xs font-black mt-2 ${timeLeft < 120 ? 'text-red-500' : 'text-yellow-700'}`}>
                      Berlaku: {timerMinutes}:{timerSeconds}
                    </p>
                  )}
                </div>

                <div className="border-2 border-black p-4 bg-gray-50 space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase">
                    <span className="text-gray-500">Paket</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase">
                    <span className="text-gray-500">Harga Paket</span>
                    <span>Rp {Number(plan.price).toLocaleString('id-ID')}</span>
                  </div>
                  {Number(txData.total_amount) > Number(plan.price) && (
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span className="text-gray-500">Kode Unik</span>
                      <span className="text-gray-400">
                        + Rp {(Number(txData.total_amount) - Number(plan.price)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between text-xs font-black uppercase">
                    <span>Total Bayar</span>
                    <span className="text-[#FF4D00]">
                      Rp {Number(txData.total_amount || plan.price).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {Number(txData.total_amount) > Number(plan.price) && (
                    <p className="text-[10px] text-gray-400">
                      *Kode unik ditambahkan otomatis oleh sistem pembayaran untuk membedakan setiap transaksi. Tidak mengurangi nilai paket.
                    </p>
                  )}
                </div>

                {/* Tombol lihat QR */}
                <button
                  onClick={() => setShowQRModal(true)}
                  className="w-full bg-[#FF4D00] text-white font-black py-4 uppercase tracking-widest hover:bg-[#e04400] transition-colors flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                >
                  <QrCode size={16} /> Lihat QR Code
                </button>

                {/* Cek status manual */}
                <button
                  onClick={handleCheckStatus}
                  disabled={checkingStatus}
                  className="w-full bg-white text-black font-black py-3 uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border-2 border-black"
                >
                  {checkingStatus
                    ? <><Loader size={16} className="animate-spin" /> Mengecek...</>
                    : <><RefreshCw size={16} /> Cek Status Pembayaran</>
                  }
                </button>

                <p className="text-[10px] text-gray-400 text-center">
                  Status dicek otomatis setiap 5 detik. Subscription aktif segera setelah pembayaran berhasil.
                </p>
              </div>

            ) : showManualFallback ? (
              /* Fallback: upload manual */
              uploadDone ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <Clock size={48} className="text-yellow-500" />
                  <h4 className="text-xl font-black uppercase">Bukti Terkirim!</h4>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Admin akan memverifikasi dalam 1×24 jam. Akses premium aktif setelah disetujui.
                  </p>
                  <button onClick={() => navigate('/dashboard')} className="mt-4 bg-black text-white font-black px-6 py-3 uppercase tracking-widest">
                    Kembali ke Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="border-l-4 border-orange-400 bg-orange-50 p-3">
                    <p className="text-xs text-orange-800 font-bold">Mode Manual (QRIS tidak tersedia)</p>
                    <p className="text-[10px] text-orange-700 mt-1">
                      Upload bukti transfer. Admin akan memverifikasi dalam 1×24 jam.
                    </p>
                  </div>

                  <div
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)) } }}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileRef.current.click()}
                    className="border-2 border-dashed border-black p-6 text-center cursor-pointer hover:bg-gray-50"
                  >
                    {preview
                      ? <img src={preview} alt="Bukti" className="max-h-48 mx-auto object-contain" />
                      : <div className="space-y-2">
                          <Upload size={32} className="mx-auto text-gray-400" />
                          <p className="text-xs font-bold text-gray-500 uppercase">Klik atau drag & drop</p>
                          <p className="text-[10px] text-gray-400">PNG, JPG (max 5MB)</p>
                        </div>
                    }
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>

                  <button
                    onClick={handleManualSubmit}
                    disabled={loadingUpload || !file}
                    className="w-full bg-[#FF4D00] text-white font-black py-4 uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 border-2 border-black"
                  >
                    {loadingUpload ? <><Loader size={18} className="animate-spin" /> Mengirim...</> : <>Kirim Bukti <ArrowRight size={18} /></>}
                  </button>

                  <button onClick={() => setShowManualFallback(false)} className="w-full text-xs text-gray-500 underline">
                    ← Coba lagi via KlikQRIS
                  </button>
                </div>
              )

            ) : (
              /* Default: tombol bayar */
              <div className="space-y-5">
                <div className="border-2 border-black p-4 bg-gray-50 space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase">
                    <span className="text-gray-500">Paket</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase">
                    <span className="text-gray-500">Nominal</span>
                    <span className="text-[#FF4D00] font-black">{plan.priceLabel}</span>
                  </div>
                  {isAuthenticated && (
                    <div className="flex justify-between text-xs font-bold uppercase border-t border-gray-200 pt-2">
                      <span className="text-gray-500">Akun</span>
                      <span className="text-gray-700">{user?.email}</span>
                    </div>
                  )}
                </div>

                <div className="border-l-4 border-blue-400 bg-blue-50 p-3">
                  <p className="text-xs text-blue-800 font-bold">Cara Pembayaran</p>
                  <ol className="text-[10px] text-blue-700 mt-1 space-y-1 list-decimal list-inside">
                    <li>Klik tombol "Bayar dengan QRIS" di bawah</li>
                    <li>Scan QR Code dengan aplikasi e-wallet / mobile banking</li>
                    <li>Kembali ke halaman ini — subscription aktif otomatis</li>
                  </ol>
                </div>

                <button
                  onClick={handleCreateInvoice}
                  disabled={loadingInvoice || !isAuthenticated}
                  className="w-full bg-[#FF4D00] text-white font-black py-4 uppercase tracking-widest hover:bg-[#e04400] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                >
                  {loadingInvoice
                    ? <><Loader size={18} className="animate-spin" /> Membuat QR...</>
                    : <><QrCode size={18} /> Bayar dengan QRIS <ArrowRight size={18} className="stroke-[3]" /></>
                  }
                </button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-gray-500">
                    <Link to="/login" className="font-bold underline">Login</Link> terlebih dahulu untuk melanjutkan pembayaran.
                  </p>
                )}

                <button
                  onClick={() => setShowManualFallback(true)}
                  className="w-full text-[10px] text-gray-400 underline text-center"
                >
                  QRIS tidak tersedia? Upload bukti transfer manual
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
                  <Lock size={10} />
                  Subscription aktif otomatis setelah pembayaran berhasil
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Riwayat Pengajuan */}
        {isAuthenticated && existingProofs.length > 0 && planKey !== 'free' && (
          <div className="mt-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black text-white px-6 py-3">
              <h3 className="text-xs font-black uppercase tracking-widest">Riwayat Transaksi</h3>
            </div>
            <div className="bg-white divide-y-2 divide-black">
              {existingProofs.map(proof => {
                const cfg = STATUS_CONFIG[proof.status] || STATUS_CONFIG.pending
                const Icon = cfg.icon
                return (
                  <div key={proof.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={cfg.color} />
                      <div>
                        <p className="text-xs font-black uppercase">
                          Paket {proof.plan.toUpperCase()} — Rp {proof.amount.toLocaleString('id-ID')}
                        </p>
                        {proof.order_id && (
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">{proof.order_id}</p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {new Date(proof.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                        {proof.admin_note && (
                          <p className="text-[10px] text-red-600 mt-0.5">Catatan: {proof.admin_note}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 border ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="grid grid-cols-2 gap-0 border-x-2 border-b-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-yellow-300 border-r-2 border-black py-3 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="stroke-[2.5]" />
            <span className="text-xs font-black uppercase tracking-widest">100% Secure</span>
          </div>
          <div className="bg-gray-100 py-3 flex items-center justify-center gap-2">
            <RotateCcw size={14} className="stroke-[2.5]" />
            <span className="text-xs font-black uppercase tracking-widest">14-Day Refund</span>
          </div>
        </div>

      </main>

      <footer className="border-t-2 border-black mt-16 px-6 py-10 bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-xl font-black uppercase tracking-tighter">EDUTASK</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            © 2026 EduTask Inc. All rights reserved.
          </p>
        </div>
      </footer>

      {/* QR Payment Modal */}
      {showQRModal && txData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm">

            {/* Modal Header */}
            <div className="bg-black px-5 py-4 flex items-center justify-between">
              <p className="text-white font-black text-lg uppercase tracking-tighter">Pembayaran QRIS</p>
              <button onClick={() => setShowQRModal(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Order ID + Timer */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-mono text-gray-400">{txData.order_id}</p>
                  <p className="text-xs font-bold text-gray-600 mt-0.5">{plan.name}</p>
                </div>
                {timeLeft > 0 && (
                  <div className={`flex items-center gap-1.5 border-2 border-black px-2.5 py-1 ${timeLeft < 120 ? 'bg-red-400' : 'bg-yellow-300'}`}>
                    <Clock size={12} className={timeLeft < 120 ? 'animate-pulse' : ''} />
                    <span className="text-xs font-black">{timerMinutes}:{timerSeconds}</span>
                  </div>
                )}
              </div>

              {/* Amount breakdown */}
              <div className="border-2 border-black p-4 bg-[#f5f5f0] mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                  <span>Harga Paket</span>
                  <span>Rp {Number(plan.price).toLocaleString('id-ID')}</span>
                </div>
                {Number(txData.total_amount) > Number(plan.price) && (
                  <div className="flex justify-between text-[11px] font-bold uppercase text-gray-400">
                    <span>Kode Unik</span>
                    <span>+ Rp {(Number(txData.total_amount) - Number(plan.price)).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="border-t-2 border-black pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Pembayaran</p>
                  <p className="text-3xl font-black">
                    Rp {Number(txData.total_amount || plan.price).toLocaleString('id-ID')}
                  </p>
                  {user?.nama_lengkap && (
                    <p className="text-xs font-bold text-gray-500 mt-1">a/n {user.nama_lengkap}</p>
                  )}
                </div>
                {Number(txData.total_amount) > Number(plan.price) && (
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    *Kode unik ditambahkan otomatis oleh sistem untuk membedakan transaksi. Tidak mengurangi nilai paket yang kamu dapat.
                  </p>
                )}
              </div>

              {/* QR Code Image dari KlikQRIS */}
              {txData.qris_image ? (
                <div className="flex flex-col items-center mb-5">
                  <div className="p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img
                      src={txData.qris_image}
                      alt="QRIS Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mt-2 tracking-wide">
                    Scan dengan aplikasi e-wallet / m-banking
                  </p>
                </div>
              ) : txData.qris_url ? (
                <div className="flex flex-col items-center mb-5">
                  <div className="p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img
                      src={txData.qris_url}
                      alt="QRIS Code"
                      className="w-48 h-48 object-contain"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mt-2 tracking-wide">
                    Scan dengan aplikasi e-wallet / m-banking
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-black mb-5">
                  <div className="text-center">
                    <QrCode size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs font-bold uppercase text-gray-400">QR tidak tersedia</p>
                  </div>
                </div>
              )}

              {/* Cek Status */}
              <button
                onClick={async () => { await handleCheckStatus() }}
                disabled={checkingStatus}
                className="w-full py-3.5 bg-black text-white font-black text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingStatus
                  ? <><Loader size={16} className="animate-spin" /> Mengecek...</>
                  : <><RefreshCw size={16} /> Cek Status Pembayaran</>
                }
              </button>

              <p className="text-center text-[10px] text-gray-400 font-bold uppercase mt-3 tracking-wide">
                Status dicek otomatis setiap 5 detik
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
