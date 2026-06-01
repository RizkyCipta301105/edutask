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
            <h3>Profil</h3>
          </div>
          <div className="settings-card">
            <div className="settings-card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '1.2rem', fontWeight: 600,
                }}>
                  {user.nama_lengkap?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>{user.nama_lengkap || user.username}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{user.email}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: 4 }}>
                    {user.role && <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Role: {user.role}</span>}
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
                  <Crown size={20} color={isTeam ? '#7c3aed' : isPro ? '#FF4D00' : '#9ca3af'} />
                  <span style={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: isTeam ? '#7c3aed' : isPro ? '#FF4D00' : '#374151',
                    textTransform: 'uppercase',
                  }}>
                    {plan === 'team' ? 'Team Plan' : plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: isActive ? '#d1fae5' : '#fee2e2',
                    color: isActive ? '#065f46' : '#991b1b',
                    textTransform: 'uppercase',
                  }}>
                    {isActive ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>

                {/* End date */}
                {subscription?.end_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: '0.85rem' }}>
                    <Clock size={14} />
                    Aktif hingga: {new Date(subscription.end_date).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                )}

                {/* Feature list */}
                {subscription?.features && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {Object.entries(subscription.features)
                      .filter(([key, val]) => val === true)
                      .map(([key]) => (
                        <span key={key} style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          background: '#f3f4f6',
                          border: '1px solid #e5e7eb',
                          borderRadius: 4,
                          color: '#374151',
                          textTransform: 'capitalize',
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
                padding: '10px 16px', borderRadius: 6, marginBottom: 16, fontSize: '0.9rem',
                background: passwordMsg.type === 'error' ? '#fef2f2' : '#d1fae5',
                color: passwordMsg.type === 'error' ? '#dc2626' : '#065f46',
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
            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#374151' }}>
              {roleView === 'dosen' ? 'Notifikasi Evaluasi & Pengumpulan Tugas' : (roleView === 'mahasiswa' ? 'Notifikasi Tenggat Waktu (Deadline) Kuliah' : 'Notifikasi Task Pribadi')}
            </span>
          </div>
          <div className="auth-desc" style={{ marginTop: 8 }}>
            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
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
            <span style={{ fontSize: '0.95rem' }}>
              Autentikasi 2 langkah {twoFAEnabled ? <span style={{ color: '#16a34a', fontWeight: 600 }}>aktif</span> : <span style={{ color: '#6b7280' }}>nonaktif</span>}
            </span>
            {twoFAEnabled && <Check size={20} color="#16a34a" />}
          </div>
          <div className="auth-desc">
            <Shield size={20} color="#374151" />
            <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.5' }}>
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
        <div className="settings-card deactivate-card">
          <span style={{ fontSize: '0.95rem', color: '#111827' }}>
            {showDeactivateConfirm ? 'Anda yakin ingin keluar?' : 'Anda dapat login kembali kapan saja.'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {showDeactivateConfirm && (
              <button className="btn-outline" onClick={() => setShowDeactivateConfirm(false)}>Batal</button>
            )}
            <button className="btn-danger-bg" style={showDeactivateConfirm ? { background: '#ef4444', color: 'white' } : {}} onClick={handleDeactivate}>
              {showDeactivateConfirm ? 'Konfirmasi Keluar' : 'Keluar dari akun'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
