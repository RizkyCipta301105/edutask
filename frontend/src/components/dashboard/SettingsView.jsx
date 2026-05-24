import { useState } from 'react'
import { EyeOff, Eye, Shield, Monitor, Smartphone, Layout, Check, LogOut } from 'lucide-react'
import authService from '../../services/authService'

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
