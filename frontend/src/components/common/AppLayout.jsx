import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Search, Bell, Menu as MenuIcon, LayoutDashboard, ClipboardList,
  CalendarDays, Settings, HelpCircle, X, LogOut, ChevronDown,
  Mail, Moon, Sun, User, Sparkles, BookOpen, Crown, GraduationCap, Lightbulb
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { normalizeUserRole, getRoleDashboardPath } from '../../utils/authHelpers'
import NotificationDropdown from '../dashboard/NotificationDropdown'
import toast from 'react-hot-toast'
import api from '../../services/api'
import taskService from '../../services/taskService'
import { useSubscription } from '../../hooks/useSubscription'
import { motion } from 'framer-motion'

import PageTransition from './PageTransition'

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
      // Dark mode toggle removed
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
  }, [paletteQuery, allTasks, role, navigate, logout])

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

        {/* Sidebar Neo-Brutalism */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''} border-r-4 border-black bg-yellow-300`}>
          <div className="profile-section mb-6">
            <div className="project-logo border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white h-12 w-12 flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform">
              <span className="font-black text-black text-xl">ET</span>
            </div>
            <div className="profile-info">
              <h3>EduTask</h3>
              <p style={{ textTransform: 'capitalize' }}>{role || 'User'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links flex flex-col gap-3 mt-4 relative">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const active = isLinkActive(path)
              return (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path)
                    setSidebarOpen(false)
                  }}
                  className={`relative flex items-center gap-3 w-full text-left px-4 py-3 font-bold transition-all z-10 ${
                    active
                      ? 'bg-blue-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black translate-x-[-2px] translate-y-[-2px]'
                      : 'border-2 border-black bg-white text-black hover:bg-pink-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                  }`}
                >
                  <Icon size={20} className="stroke-2 shrink-0" />
                  <span className="whitespace-nowrap text-[0.95rem]">{label}</span>
                </button>
              )
            })}
          </nav>

          {/* Bottom Sidebar Controls */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!subLoading && isFree && (
              <button
                className="w-full flex items-center justify-center gap-2 border-2 border-black bg-green-400 px-4 py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                onClick={() => navigate('/checkout?plan=pro')}
              >
                <Crown size={18} className="stroke-2" /> Upgrade Pro
              </button>
            )}
            <button
              className="w-full flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-3 font-black uppercase text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-500 hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={logout}
            >
              <LogOut size={18} className="stroke-2" /> Keluar
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content bg-gray-100">
          <header className="header relative z-[100] !border-b-4 !border-black !mb-4 !pb-3 flex items-center gap-2 flex-wrap md:flex-nowrap">
            {/* Mobile Burger Menu */}
            <button className="mobile-menu-btn flex-shrink-0" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={24} />
            </button>

            {/* Search Bar */}
            {showSearch ? (
              <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full md:max-w-sm order-3 md:order-none mt-2 md:mt-0">
                <Search size={20} className="text-black stroke-2 flex-shrink-0" />
                <input
                  type="text"
                  className="flex-1 min-w-0 border-none bg-transparent outline-none font-bold placeholder-gray-500 text-sm"
                  placeholder={role === 'umum' ? 'Cari tugas...' : 'Cari tugas akademis...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <X
                    size={20}
                    className="cursor-pointer text-black stroke-2 hover:text-red-500 flex-shrink-0"
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 hidden md:block" />
            )}

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto flex-shrink-0">

              <div className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white p-1 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform">
                <NotificationDropdown />
              </div>
              
              {/* Help Button — hide on very small screens */}
              <button className="hidden sm:flex h-9 w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center border-2 border-black bg-pink-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onClick={() => setShowHelpModal(true)} title="Bantuan">
                <HelpCircle size={18} className="text-black stroke-2" />
              </button>

              {/* User Profile Avatar */}
              <div style={{ position: 'relative' }}>
                <div 
                  className="h-9 w-9 md:h-10 md:w-10 flex flex-shrink-0 cursor-pointer items-center justify-center border-2 border-black bg-blue-400 font-black text-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
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

          {/* Email Verification Banner — Neo Brutalism */}
          {user && !user.is_email_verified && (
            <div className="mx-4 md:mx-8 mt-4 md:mt-6 border-[3px] border-black bg-[#FFE500] p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-black border-[2px] border-black">
                  <Mail size={16} className="text-[#FFE500]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-black text-xs uppercase tracking-wide">Verifikasi Email Anda</h4>
                  <p className="text-xs font-bold text-black mt-0.5 truncate">
                    Verifikasi email {user.email} untuk akses semua fitur.
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
                className="self-start sm:self-auto flex-shrink-0 border-[3px] border-black bg-black px-4 py-2 text-xs font-black text-white uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Kirim Ulang
              </button>
            </div>
          )}

          {/* Render child pages dynamically inside the page-content container */}
          <div className={`page-content ${scrollable ? 'scroll-y' : 'no-scroll'} ${user && !user.is_email_verified ? '!pt-4' : ''}`}>
            <PageTransition>
              {children}
            </PageTransition>
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
                  Gunakan tab <strong>Dashboard</strong> untuk memantau kemajuan kelas (Ruang Edukasi) dan grafik analitik performa.
                </li>
                <li>
                  Gunakan tab <strong>Tugas Akademik</strong> untuk mengelola tugas dalam bentuk Backlog maupun Kanban Board.
                </li>
                <li>
                  Gunakan tab <strong>Jadwal & Kalender</strong> untuk melihat jadwal kuliah mingguan dan tenggat waktu tugas secara visual.
                </li>
                <li>
                  Gunakan tab <strong>Pengaturan</strong> untuk mengubah profil atau mengganti kata sandi keamanan Anda.
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
