import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Search, Bell, Menu as MenuIcon, LayoutDashboard, ClipboardList,
  CalendarDays, Settings, HelpCircle, X, LogOut, ChevronDown,
  Mail, Moon, Sun, User, Sparkles, BookOpen, Crown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { normalizeUserRole, getRoleDashboardPath } from '../../utils/authHelpers'
import NotificationDropdown from '../dashboard/NotificationDropdown'
import toast from 'react-hot-toast'
import api from '../../services/api'
import taskService from '../../services/taskService'
import { useSubscription } from '../../hooks/useSubscription'

// Premium layout styles
import '../../styles/dashboard.css'

export default function AppLayout({ children, showSearch = false, searchQuery = '', setSearchQuery = () => {}, scrollable = true }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const role = normalizeUserRole(user)
  const { isFree, plan, loading: subLoading } = useSubscription()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  
  // Dark mode
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  // Command Palette States
  const [showPalette, setShowPalette] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')
  const [allTasks, setAllTasks] = useState([])
  const [paletteSelectedIndex, setPaletteSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowPalette(prev => !prev)
        setPaletteQuery('')
      } else if (e.key === 'Escape') {
        setShowPalette(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (showPalette) {
      taskService.getTasks()
        .then(data => setAllTasks(data || []))
        .catch(console.error)
    }
  }, [showPalette])

  const commandItems = useMemo(() => {
    const isUmum = role === 'umum'
    const baseActions = [
      { id: 'nav-dash', label: 'Beralih ke Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
      { id: 'nav-task', label: isUmum ? 'Beralih ke Tugas & Proyek' : 'Beralih ke Tugas Akademik', icon: ClipboardList, action: () => navigate('/tasks') },
      { id: 'nav-schedule', label: 'Beralih ke Jadwal & Kalender', icon: CalendarDays, action: () => navigate('/schedule') },
      { id: 'nav-profile', label: 'Beralih ke Pengaturan', icon: Settings, action: () => navigate('/profile') },
      { id: 'action-theme', label: `Ubah ke Mode ${isDark ? 'Terang' : 'Gelap'}`, icon: isDark ? Sun : Moon, action: () => setIsDark(!isDark) },
      { id: 'action-logout', label: 'Keluar dari Akun', icon: LogOut, action: logout }
    ]

    const query = paletteQuery.toLowerCase().trim()
    const filteredActions = baseActions.filter(item => 
      item.label.toLowerCase().includes(query)
    )

    const filteredTasks = allTasks.filter(t => 
      t.judul?.toLowerCase().includes(query) || t.deskripsi?.toLowerCase().includes(query)
    ).slice(0, 5).map(t => ({
      id: `task-${t.id}`,
      label: `Buka Tugas: ${t.judul}`,
      icon: ClipboardList,
      action: () => navigate(`/tasks?task=${t.id}`)
    }))

    return [...filteredActions, ...filteredTasks]
  }, [paletteQuery, allTasks, role, isDark, navigate, logout])

  useEffect(() => {
    if (showPalette) {
      setPaletteSelectedIndex(0)
    }
  }, [paletteQuery, showPalette])

  const handlePaletteKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setPaletteSelectedIndex(prev => (prev + 1) % commandItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setPaletteSelectedIndex(prev => (prev - 1 + commandItems.length) % commandItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (commandItems[paletteSelectedIndex]) {
        commandItems[paletteSelectedIndex].action()
        setShowPalette(false)
      }
    }
  }

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const userInitials = useMemo(() => {
    if (!user?.nama_lengkap) return 'U'
    return user.nama_lengkap
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [user])

  const navLinks = useMemo(() => {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/tasks', label: role === 'umum' ? 'Tugas & Proyek' : 'Tugas Akademik', icon: ClipboardList },
      { path: '/schedule', label: 'Jadwal & Kalender', icon: CalendarDays },
      { path: '/profile', label: 'Pengaturan', icon: Settings },
    ]
  }, [role])

  // Check if a path is active (exact match or prefix for sub-routes)
  const isLinkActive = (path) => {
    if (path === '/dashboard') {
      return pathname.startsWith('/dashboard')
    }
    return pathname === path
  }

  return (
    <div className="edutask-dashboard" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="app-container">
        
        {/* Sidebar Mobile Overlay */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} 
          onClick={() => setSidebarOpen(false)} 
        />

        {/* Sidebar Premium */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="profile-section">
            <div className="project-logo">
              <div className="triangle"></div>
            </div>
            <div className="profile-info">
              <h3>EduTask</h3>
              <p style={{ textTransform: 'capitalize' }}>{role || 'User'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => {
                  navigate(path)
                  setSidebarOpen(false)
                }}
                className={`nav-item ${isLinkActive(path) ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center' }}
              >
                <Icon size={20} /> {label}
              </button>
            ))}
          </nav>

          {/* Bottom Sidebar Controls */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Upgrade CTA untuk user Free */}
            {!subLoading && isFree && (
              <button
                className="invite-btn"
                style={{
                  background: '#FF4D00',
                  border: '1px solid #cc3d00',
                  color: 'white',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={() => navigate('/checkout?plan=pro')}
              >
                <Crown size={14} /> Upgrade ke Pro
              </button>
            )}
            <button
              className="invite-btn"
              style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#ef4444' }}
              onClick={logout}
            >
              <LogOut size={16} /> Keluar Akun
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <header className="header">
            {/* Mobile Burger Menu */}
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={24} />
            </button>

            {/* Search Bar (Renders if enabled) */}
            {showSearch ? (
              <div className="search-bar">
                <Search size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder={role === 'umum' ? 'Cari tugas & proyek...' : 'Cari tugas akademis...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <X
                    size={16}
                    color="var(--text-muted)"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Header Right Actions */}
            <div className="header-actions">
              <button 
                className="btn-icon" 
                onClick={() => setIsDark(!isDark)} 
                title={isDark ? "Matikan Mode Gelap" : "Nyalakan Mode Gelap"}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <NotificationDropdown />
              
              {/* Help Button */}
              <button className="btn-icon" onClick={() => setShowHelpModal(true)} title="Bantuan">
                <HelpCircle size={20} />
              </button>

              {/* User Profile Avatar */}
              <div style={{ position: 'relative' }}>
                <div 
                  className="user-avatar" 
                  style={{ background: '#374151', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  {userInitials}
                </div>
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <div className="profile-header">
                      <div className="profile-name">{user?.nama_lengkap || user?.username || 'User'}</div>
                      <div className="profile-email">{user?.email || 'user@example.com'}</div>
                      {user?.role === 'mahasiswa' && user?.kelas_nama && (
                        <div className="mt-1 inline-block rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                          Kelas: {user.kelas_nama}
                        </div>
                      )}
                    </div>
                    <div className="profile-menu">
                      <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                        Pengaturan Profil
                      </Link>
                      <a href="#" className="logout-link" onClick={(e) => { e.preventDefault(); logout(); }}>
                        Keluar Akun
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Email Verification Banner */}
          {user && !user.is_email_verified && (
            <div className="mx-8 mt-6 rounded-xl border border-[#d09730] bg-[#fdfaf4] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fceec9]">
                  <Mail size={20} className="text-[#8b6914]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#3d300a]">Verifikasi Email Anda</h4>
                  <p className="text-sm text-[#8b6914]">
                    Silakan verifikasi email {user.email} untuk mengakses semua fitur.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  let toastId
                  try {
                    toastId = toast.loading('Mengirim email verifikasi...')
                    await api.post('/api/auth/send-verification/')
                    toast.success('Email verifikasi berhasil dikirim. Silakan cek inbox Anda.', { id: toastId })
                  } catch (err) {
                    toast.error('Gagal mengirim email verifikasi.', { id: toastId })
                  }
                }}
                className="rounded-lg bg-[#4B3A2F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d3025]"
              >
                Kirim Ulang Email
              </button>
            </div>
          )}

          {/* Render child pages dynamically inside the page-content container */}
          <div className={`page-content ${scrollable ? 'scroll-y' : 'no-scroll'} ${user && !user.is_email_verified ? '!pt-4' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Shared Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-container" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Bantuan & Panduan</span>
              <X size={20} onClick={() => setShowHelpModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ marginBottom: 16 }}>Bagaimana cara mengelola akademis Anda?</p>
              <ul style={{ listStyle: 'disc', marginLeft: 20, color: '#374151', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li>
                  Gunakan tab **Dashboard** untuk memantau kemajuan kelas (Ruang Edukasi) dan grafik analitik performa.
                </li>
                <li>
                  Gunakan tab **Tugas Akademik** untuk mengelola tugas dalam bentuk Backlog maupun Kanban Board.
                </li>
                <li>
                  Gunakan tab **Jadwal & Kalender** untuk melihat jadwal kuliah mingguan dan tenggat waktu tugas secara visual.
                </li>
                <li>
                  Gunakan tab **Pengaturan** untuk mengubah profil atau mengganti kata sandi keamanan Anda.
                </li>
              </ul>
              <button className="btn-dark" style={{ width: '100%', marginTop: 24 }} onClick={() => setShowHelpModal(false)}>Dimengerti</button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette Overlay */}
      {showPalette && (
        <div className="command-palette-backdrop" onClick={() => setShowPalette(false)}>
          <div className="command-palette-container" onClick={e => e.stopPropagation()}>
            <div className="command-palette-search-wrapper">
              <Search size={20} className="text-slate-400" />
              <input
                type="text"
                className="command-palette-search-input"
                placeholder="Ketik perintah atau cari tugas... (Gunakan ↑/↓ dan Enter)"
                value={paletteQuery}
                onChange={e => setPaletteQuery(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
                autoFocus
              />
              <span className="command-palette-shortcut">ESC</span>
            </div>
            <div className="command-palette-results">
              {commandItems.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada hasil ditemukan.
                </div>
              ) : (
                <div className="command-palette-section">
                  <div className="command-palette-section-title">Navigasi & Aksi Cepat</div>
                  {commandItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = index === paletteSelectedIndex
                    return (
                      <div
                        key={item.id}
                        className={`command-palette-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          item.action()
                          setShowPalette(false)
                        }}
                      >
                        <div className="command-palette-item-left">
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </div>
                        {item.id.startsWith('nav-') && (
                          <span className="command-palette-shortcut">Beralih</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
