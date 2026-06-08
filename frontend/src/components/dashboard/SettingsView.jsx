import { useState } from 'react'
import { EyeOff, Eye, Shield, Monitor, Smartphone, Layout, Check, LogOut, Crown, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import authService from '../../services/authService'
import { useSubscription } from '../../hooks/useSubscription'

export default function SettingsView({ onLogout, user, roleView = 'umum' }) {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Browser saat ini', icon: 'monitor', active: true, date: new Date().toLocaleString('id-ID'), location: 'Sesi aktif' },
  ])
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(true)

  const { subscription, plan, isActive, isFree, isPro, isTeam, loading: subLoading } = useSubscription()

  const handlePasswordChange = async () => {
    if (!passwords.current) { setPasswordMsg({ type: 'error', text: 'Password saat ini wajib diisi' }); return }
    if (!passwords.newPass || passwords.newPass.length < 8) { setPasswordMsg({ type: 'error', text: 'Password baru minimal 8 karakter' }); return }
    if (passwords.newPass !== passwords.confirm) { setPasswordMsg({ type: 'error', text: 'Password tidak cocok' }); return }

    setLoading(true)
    try {
      await authService.changePassword({
        password_lama: passwords.current,
        password_baru: passwords.newPass,
        password_baru_confirm: passwords.confirm
      })
      setPasswordMsg({ type: 'success', text: 'Password berhasil diubah!' })
      setPasswords({ current: '', newPass: '', confirm: '' })
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal mengubah password. Periksa kembali input Anda.'
      setPasswordMsg({ type: 'error', text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const logoutSession = (id) => { setSessions(prev => prev.filter(s => s.id !== id)) }

  const handleDeactivate = () => {
    if (showDeactivateConfirm) {
      onLogout()
    } else {
      setShowDeactivateConfirm(true)
    }
  }

  const getDeviceIcon = (icon) => {
    switch (icon) {
      case 'monitor': return <Monitor className="session-icon" size={20} />
      case 'phone': return <Smartphone className="session-icon" size={20} />
      default: return <Layout className="session-icon" size={20} />
    }
  }

  return (
    <div className="settings-page">
      {/* User Info */}
      {user && (
        <div className="settings-row">
          <div className="settings-left">
            <div className="inline-block bg-[#00cfff] border-[3px] border-black px-2 py-0.5 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2 -rotate-1">Profil</div>
            <h3>Profil Pengguna</h3>
          </div>
          <div className="settings-card" style={{ borderColor: '#000', boxShadow: '8px 8px 0px 0px #000' }}>
            <div className="settings-card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 64, height: 64, background: '#FF4D00', border: '5px solid #000', boxShadow: '5px 5px 0px 0px #000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', flexShrink: 0
                }}>
                  {user.nama_lengkap?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: 6, color: '#000', textTransform: 'uppercase' }}>{user.nama_lengkap || user.username}</div>
                  <div style={{ color: '#000', fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>{user.email}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {user.role && <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 900, background: '#FFE500', border: '3px solid #000', padding: '2px 10px', textTransform: 'uppercase', boxShadow: '3px 3px 0px 0px #000' }}>Role: {user.role}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plan */}
      <div className="settings-row">
        <div className="settings-left">
          <h3>Paket Langganan</h3>
          <p>Status dan detail paket aktif Anda</p>
        </div>
        <div className="settings-card">
          <div className="settings-card-content">
            {subLoading ? (
              <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Memuat data subscription...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Plan badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Crown size={24} color={isTeam ? '#7c3aed' : isPro ? '#FF4D00' : '#000'} />
                  <span style={{
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    color: '#000',
                    textTransform: 'uppercase',
                  }}>
                    {plan === 'team' ? 'Team Plan' : plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    background: isActive ? '#4ade80' : '#fca5a5',
                    color: '#000',
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                    textTransform: 'uppercase',
                  }}>
                    {isActive ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>

                {/* End date */}
                {subscription?.end_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#000', fontSize: '0.9rem', fontWeight: 700 }}>
                    <Clock size={16} />
                    Aktif hingga: {new Date(subscription.end_date).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                )}

                {/* Feature list */}
                {subscription?.features && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {Object.entries(subscription.features)
                      .filter(([key, val]) => val === true)
                      .map(([key]) => (
                        <span key={key} style={{
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          padding: '4px 8px',
                          background: '#fff',
                          border: '2px solid #000',
                          boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                          color: '#000',
                          textTransform: 'uppercase',
                        }}>
                          {key.replace(/_/g, ' ')}
                        </span>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
          {isFree && (
            <div className="settings-card-footer">
              <Link
                to="/checkout?plan=pro"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#FF4D00', color: 'white', fontWeight: 700,
                  padding: '8px 16px', borderRadius: 6, fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                <Crown size={14} /> Upgrade ke Pro <ArrowRight size={14} />
              </Link>
            </div>
          )}
          {isPro && !isTeam && (
            <div className="settings-card-footer">
              <Link
                to="/checkout?plan=team"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#7c3aed', color: 'white', fontWeight: 700,
                  padding: '8px 16px', borderRadius: 6, fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                <Crown size={14} /> Upgrade ke Team <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="settings-row">
        <div className="settings-left">
          <h3>Ubah Password</h3>
        </div>
        <div className="settings-card">
          <div className="settings-card-content">
            {passwordMsg.text && (
              <div style={{
                padding: '12px 16px', marginBottom: 16, fontSize: '0.9rem', fontWeight: 700,
                border: '4px solid #000', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                background: passwordMsg.type === 'error' ? '#fca5a5' : '#86efac',
                color: '#000', textTransform: 'uppercase',
              }}>
                {passwordMsg.text}
              </div>
            )}
            <div className="settings-form-group">
              <label>Password saat ini</label>
              <div className="settings-input-wrapper">
                <input type={showPasswords.current ? 'text' : 'password'} placeholder="Masukkan password saat ini" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
                <span style={{ cursor: 'pointer' }} onClick={() => togglePasswordVisibility('current')}>
                  {showPasswords.current ? <Eye size={16} color="#6b7280" /> : <EyeOff size={16} color="#6b7280" />}
                </span>
              </div>
            </div>
            <div className="settings-form-group">
              <label>Password baru</label>
              <div className="settings-input-wrapper">
                <input type={showPasswords.newPass ? 'text' : 'password'} placeholder="Min. 8 karakter" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} />
                <span style={{ cursor: 'pointer' }} onClick={() => togglePasswordVisibility('newPass')}>
                  {showPasswords.newPass ? <Eye size={16} color="#6b7280" /> : <EyeOff size={16} color="#6b7280" />}
                </span>
              </div>
            </div>
            <div className="settings-form-group">
              <label>Konfirmasi password baru</label>
              <div className="settings-input-wrapper">
                <input type={showPasswords.confirm ? 'text' : 'password'} placeholder="Masukkan ulang password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                <span style={{ cursor: 'pointer' }} onClick={() => togglePasswordVisibility('confirm')}>
                  {showPasswords.confirm ? <Eye size={16} color="#6b7280" /> : <EyeOff size={16} color="#6b7280" />}
                </span>
              </div>
            </div>
          </div>
          <div className="settings-card-footer">
            <button className="btn-dark" onClick={handlePasswordChange} disabled={loading}>
              {loading ? 'Mengubah...' : 'Ubah password'}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences / Notifications */}
      <div className="settings-row">
        <div className="settings-left">
          <h3>Preferensi Notifikasi</h3>
          <p>Kelola pemberitahuan aktivitas akun Anda</p>
        </div>
        <div className="settings-card">
          <div className="auth-status">
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>
              {roleView === 'dosen' ? 'Notifikasi Evaluasi & Pengumpulan Tugas' : (roleView === 'mahasiswa' ? 'Notifikasi Tenggat Waktu (Deadline) Kuliah' : 'Notifikasi Task Pribadi')}
            </span>
          </div>
          <div className="auth-desc" style={{ marginTop: 8 }}>
            <p style={{ fontSize: '0.9rem', color: '#000', fontWeight: 700 }}>
              Dapatkan peringatan melalui antarmuka saat ada pembaruan penting.
            </p>
          </div>
          <div className="settings-card-footer">
            <button className={notifEnabled ? 'btn-outline' : 'btn-dark'} onClick={() => setNotifEnabled(!notifEnabled)}>
              {notifEnabled ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        </div>
      </div>

      {/* 2-Step Auth */}
      <div className="settings-row">
        <div className="settings-left">
          <h3>Autentikasi 2 Langkah</h3>
          <p>Tambah lapisan keamanan ekstra ke akun Anda</p>
        </div>
        <div className="settings-card">
          <div className="auth-status">
            <span style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase' }}>
              Autentikasi 2 langkah {twoFAEnabled ? <span style={{ color: '#000', background: '#4ade80', padding: '2px 8px', border: '2px solid #000' }}>AKTIF</span> : <span style={{ color: '#000', background: '#fca5a5', padding: '2px 8px', border: '2px solid #000' }}>NONAKTIF</span>}
            </span>
            {twoFAEnabled && <Check size={24} color="#000" />}
          </div>
          <div className="auth-desc">
            <Shield size={24} color="#000" />
            <p style={{ fontSize: '0.9rem', color: '#000', fontWeight: 700, lineHeight: '1.5' }}>
              {twoFAEnabled
                ? 'Autentikasi dua faktor aktif. Akun Anda memiliki lapisan keamanan tambahan.'
                : 'Jika terdeteksi login dari perangkat yang tidak dikenal, kami akan meminta password dan kode verifikasi.'}
            </p>
          </div>
          <div className="settings-card-footer">
            <button className={twoFAEnabled ? 'btn-outline' : 'btn-dark'} onClick={() => setTwoFAEnabled(!twoFAEnabled)}>
              {twoFAEnabled ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="settings-row">
        <div className="settings-left">
          <h3>Sesi Login</h3>
          <p>Perangkat dan tempat di mana Anda login</p>
        </div>
        <div className="settings-card">
          {sessions.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>Tidak ada sesi aktif</div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="session-item">
                <div className="session-info">
                  {getDeviceIcon(session.icon)}
                  <div>
                    <div className="session-title">
                      {session.device} {session.active && <span className="session-badge">Aktif</span>}
                    </div>
                    <div className="session-meta">{session.date}<br />{session.location}</div>
                  </div>
                </div>
                <button className="btn-outline" onClick={() => {
                  if (session.active) { onLogout() } else { logoutSession(session.id) }
                }}>
                  <LogOut size={14} style={{ display: 'inline', marginRight: 4 }} /> Keluar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deactivate */}
      <div className="settings-row">
        <div className="settings-left"><h3>Keluar</h3></div>
        <div className="settings-card deactivate-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 900, color: '#000', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>
            {showDeactivateConfirm ? 'Anda yakin ingin keluar?' : 'Anda dapat login kembali kapan saja.'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {showDeactivateConfirm && (
              <button className="btn-outline" onClick={() => setShowDeactivateConfirm(false)}>Batal</button>
            )}
            <button className="btn-danger-bg" style={showDeactivateConfirm ? { background: '#ef4444', color: 'white', border: '4px solid #000', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' } : {}} onClick={handleDeactivate}>
              {showDeactivateConfirm ? 'Konfirmasi Keluar' : 'Keluar dari akun'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
