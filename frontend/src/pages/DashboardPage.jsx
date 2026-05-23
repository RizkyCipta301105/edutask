import { useState, useMemo, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Search, Plus, Bell, Menu as MenuIcon, Layers, Columns, BarChart2,
  MessageSquare, Settings, HelpCircle, X, LogOut, ChevronDown,
  BookOpen, Send, Calendar, Users, Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'
import taskService from '../services/taskService'

// Premium adapted task components
import Backlog from '../components/tasks/Backlog'
import Board from '../components/tasks/Board'
import Report from '../components/tasks/Report'
import AddTaskModal from '../components/tasks/AddTaskModal'
import TaskDetailModal from '../components/tasks/TaskDetailModal'
import MataKuliahModal from '../components/tasks/MataKuliahModal'
import RuangEdukasiList from '../components/tasks/RuangEdukasiList'

// Optional mockup components
import SettingsView from '../components/dashboard/SettingsView'
import DosenBroadcastView from '../components/dashboard/DosenBroadcastView'
import CalendarView from '../components/dashboard/CalendarView'
import Inbox from '../components/dashboard/Inbox'

// Premium layout styles scoped under .yahya-dashboard
import '../styles/yahya-dashboard.css'

const STATUS_MAP = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done'
}

export default function DashboardPage({ roleView = null }) {
  const { user, logout } = useAuth()
  const role = normalizeUserRole(user)
  const {
    board,
    setBoard,
    mataKuliah,
    loading,
    fetchBoard,
    createTask,
    updateTask,
    deleteTask,
    moveTask
  } = useTasks()

  const [activeTab, setActiveTab] = useState(role === 'dosen' ? 'Ruang' : 'Board')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  
  // Modals
  const [showMataKuliahModal, setShowMataKuliahModal] = useState(false)

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  // Real-time notifications from API
  const [notifications, setNotifications] = useState([])

  // State khusus Dosen
  const [dosenReportStats, setDosenReportStats] = useState(null)

  // Fetch Notifications with Polling
  useEffect(() => {
    const fetchNotifs = () => {
      taskService.getNotifications()
        .then(res => setNotifications(res))
        .catch(err => console.error("Gagal memuat notifikasi:", err))
    }
    fetchNotifs()
    const intervalId = setInterval(fetchNotifs, 30000)
    return () => clearInterval(intervalId)
  }, [])

  // Mengambil Rekap Report Dosen saat tab Report dibuka
  useEffect(() => {
    if (roleView === 'dosen') {
      taskService.getDosenReport()
        .then(res => {
          if (res && res.stats) {
            setDosenReportStats(res.stats)
          } else if (res && typeof res.todo !== 'undefined') {
            setDosenReportStats(res)
          }
        })
        .catch(err => console.error("Gagal memuat report dosen:", err))
    }
  }, [roleView, activeTab])

  // Redirect if role is invalid or mismatched
  if (!roleView || roleView !== role) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }

  const handleSaveMataKuliah = async (payload, id) => {
    if (id) {
      await taskService.updateMataKuliah(id, payload)
    } else {
      await taskService.createMataKuliah(payload)
    }
    fetchBoard() // Refresh courses and board
  }

  // Handle task filtering by sidebar selected course (Mata Kuliah)
  const tasks = useMemo(() => {
    let flatList = [
      ...(board.todo || []),
      ...(board.in_progress || []),
      ...(board.done || [])
    ]
    
    // Terapkan filter mata kuliah jika ada
    if (selectedCourseId) {
      flatList = flatList.filter(t => {
        // t.mata_kuliah bisa berupa string UUID, atau object (t.mata_kuliah.id)
        const mkId = t.mata_kuliah?.id ? t.mata_kuliah.id : t.mata_kuliah;
        return String(mkId) === String(selectedCourseId);
      })
    }
    
    const q = (searchQuery || '').toLowerCase().trim()
    if (q) {
      flatList = flatList.filter(t => {
        const judulMatch = t.judul?.toLowerCase().includes(q)
        const deskripsiMatch = t.deskripsi?.toLowerCase().includes(q)
        return judulMatch || deskripsiMatch
      })
    }
    
    return flatList
  }, [board, selectedCourseId, searchQuery])

  // Group tasks filtered by status to pass to components like Report
  const tasksByStatus = useMemo(() => {
    const groups = { todo: [], in_progress: [], done: [] }
    tasks.forEach(t => {
      let status = t.status
      if (status === 'in-progress') status = 'in_progress'
      if (status === 'completed') status = 'done'

      if (groups[status]) {
        groups[status].push(t)
      } else {
        groups.todo.push(t)
      }
    })
    return groups
  }, [tasks])

  // Custom tabs based on role permissions
  const filteredTabs = useMemo(() => {
    const baseTabs = [
      { key: 'Projects', label: roleView === 'dosen' ? 'Penugasan' : 'Backlog', icon: roleView === 'dosen' ? Briefcase : Layers },
      { key: 'Board',    label: roleView === 'dosen' ? 'Tugas Pribadi' : 'Board', icon: Columns },
      { key: 'Calendar', label: 'Calendar', icon: Calendar },
      { key: 'Report',   label: 'Report',   icon: BarChart2 },
      { key: 'Inbox',    label: 'Inbox',    icon: MessageSquare },
      { key: 'Settings', label: 'Settings', icon: Settings },
    ]
    if (roleView !== 'umum') {
      baseTabs.unshift({ key: 'Ruang', label: 'Ruang', icon: Users })
    }
    return baseTabs
  }, [roleView])

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

  // Utility to push local notifications
  const addNotification = (text) => {
    setNotifications(prev => [
      { id: Date.now(), pesan: text, is_read: false, created_at: new Date().toISOString() },
      ...prev
    ])
  }

  // --- CRUD Handlers ---
  const handleTaskClick = async (taskId) => {
    let taskObj = tasks.find(t => t.id === taskId)
    if (!taskObj) {
      try {
        taskObj = await taskService.getTaskDetail(taskId)
      } catch (err) {
        console.error("Gagal memuat detail task:", err)
        return
      }
    }
    setSelectedTask(taskObj)
    setModalType('taskDetail')
  }

  const handleAddTaskClick = () => {
    setModalType('addTask')
  }

  const handleCreateTask = async (data) => {
    const newTask = await createTask(data)
    addNotification(`Task "${newTask.judul}" berhasil dibuat`)
    setModalType(null)
  }

  const handleUpdateTask = async (id, data) => {
    const updated = await updateTask(id, data)
    if (data.status) {
      const statusLabel = STATUS_MAP[data.status] || data.status
      addNotification(`Status task "${updated.judul}" diperbarui ke "${statusLabel}"`)
    } else {
      addNotification(`Detail task "${updated.judul}" diperbarui`)
    }
  }

  const handleMoveTask = async (taskId, overCol) => {
    // 1. Optimistic update: langsung geser kartunya di layar pengguna (supaya mulus)
    setBoard(prev => {
      const next = { todo: [...(prev.todo||[])], in_progress: [...(prev.in_progress||[])], done: [...(prev.done||[])] }
      let targetTask = null
      for (const col of ['todo', 'in_progress', 'done']) {
        const idx = next[col].findIndex(t => String(t.id) === String(taskId))
        if (idx !== -1) {
          targetTask = { ...next[col][idx], status: overCol }
          next[col].splice(idx, 1)
          break
        }
      }
      if (targetTask) {
        next[overCol].push(targetTask)
      }
      return next
    })
    
    // 2. Hubungi backend untuk menyimpan data. 
    try {
      await moveTask(taskId, null, overCol, 0)
      // Jika butuh refresh agar benar-benar sinkron (mencegah snap-back bila urutan error):
      fetchBoard() 
    } catch (e) {
      console.error("Gagal move task", e)
    }
  }

  const handleDeleteTask = async (id) => {
    const targetTask = tasks.find(t => t.id === id)
    await deleteTask(id)
    if (targetTask) {
      addNotification(`Task "${targetTask.judul}" berhasil dihapus`)
    }
    setSelectedTask(null)
    setModalType(null)
  }

  const handleInvite = (email) => {
    if (!email || !email.trim()) return
    toast.success(`Undangan kolaborasi telah dikirim ke ${email}!`)
    setModalType(null)
  }

  const handleCourseClick = (courseId) => {
    setSelectedCourseId(prev => prev === courseId ? null : courseId)
  }

  const renderActiveTabContent = () => {
    if (loading && activeTab !== 'Inbox' && activeTab !== 'Settings') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ color: '#6b7280', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#374151', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span>Memuat data task akademis...</span>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'Ruang':
        return <RuangEdukasiList role={roleView} />
      case 'Projects':
        return roleView === 'dosen'
          ? <DosenBroadcastView user={user} onTaskClick={handleTaskClick} />
          : (
            <Backlog
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTaskClick}
              searchQuery={searchQuery}
              roleView={roleView}
            />
          )
      case 'Report':
        return (
          <Report
            tasks={roleView === 'dosen' ? [] : (tasks || [])}
            tasksByStatus={roleView === 'dosen' ? (dosenReportStats || {todo: 0, in_progress: 0, done: 0}) : (tasksByStatus || {todo: [], in_progress: [], done: []})}
            roleView={roleView}
          />
        )
      case 'Board':
        return (
          <Board
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTaskClick}
            onMoveTask={handleMoveTask}
            roleView={roleView}
          />
        )
      case 'Calendar':
        return <CalendarView tasks={tasks} mataKuliah={mataKuliah} onTaskClick={handleTaskClick} roleView={roleView} />
      case 'Inbox':
        return <Inbox user={user} roleView={roleView} />
      case 'Settings':
        return <SettingsView onLogout={logout} user={user} roleView={roleView} />
      default:
        return null
    }
  }

  return (
    <div className="yahya-dashboard" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="app-container">
        {/* Sidebar Mobile Overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="profile-section">
            <div className="project-logo">
              <div className="triangle"></div>
            </div>
            <div className="profile-info">
              <h3>EduTask</h3>
              <p style={{ textTransform: 'capitalize' }}>{roleView}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            {filteredTabs.map(({ key, label, icon: Icon }) => (
              <a
                key={key}
                href="#"
                className={`nav-item ${activeTab === key ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveTab(key)
                  setSidebarOpen(false)
                }}
              >
                <Icon size={20} /> {label}
              </a>
            ))}
          </nav>

          {/* Academic Courses (Labels filter) */}
          {mataKuliah && mataKuliah.length > 0 && (
            <>
              <div className="nav-section-title">
                <span>Mata Kuliah</span>
                <BookOpen size={16} />
              </div>
              <nav className="nav-links" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {mataKuliah.map(mk => (
                  <a
                    key={mk.id}
                    href="#"
                    className={`nav-item ${selectedCourseId === mk.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleCourseClick(mk.id)
                      setSidebarOpen(false)
                    }}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <BookOpen size={16} color={selectedCourseId === mk.id ? '#111827' : '#9ca3af'} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mk.nama}
                    </span>
                  </a>
                ))}
              </nav>
              <div style={{ padding: '0 24px', marginTop: 8 }}>
                <button 
                  onClick={() => setShowMataKuliahModal(true)} 
                  style={{ background: 'transparent', border: '1px dashed #d1d5db', color: '#6b7280', width: '100%', padding: '8px 0', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Plus size={14} /> Tambah Jadwal Kuliah
                </button>
              </div>
            </>
          )}

          {/* Bottom Sidebar Controls */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="invite-btn" onClick={() => setModalType('invite')}>
              <Plus size={16} /> Kolaborasi Tim
            </button>
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

            {/* Global Search Bar */}
            <div className="search-bar">
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Cari task akademis..."
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

            {/* Header Right Actions */}
            <div className="header-actions">
              {/* Help Center */}
              <button className="btn-icon" onClick={() => setModalType('help')} title="Bantuan">
                <HelpCircle size={20} />
              </button>

              {/* Real-time Notifications Bell */}
              <div style={{ position: 'relative' }}>
                <button className="btn-icon" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell size={20} />
                  {notifications.some(n => !n.read) && (
                    <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <strong>Notifikasi</strong>
                      <span style={{cursor: 'pointer'}} onClick={async () => {
                        await taskService.markNotificationRead();
                        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                      }}>Tandai semua dibaca</span>
                    </div>
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                      {notifications.map(n => (
                        <div key={n.id} className={`notif-item ${n.is_read ? '' : 'unread'}`} onClick={async () => {
                            if (!n.is_read) {
                                await taskService.markNotificationRead(n.id);
                                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
                            }
                        }}>
                          <div>{n.pesan}</div>
                          <div className="notif-time">{new Date(n.created_at).toLocaleString('id-ID')}</div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Tidak ada notifikasi</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Task Button (Scoped to Task Views) */}
              {(activeTab === 'Projects' || activeTab === 'Board') && (
                <button className="btn-dark" onClick={handleAddTaskClick}>
                  <Plus size={16} /> <span>Tambah task</span>
                </button>
              )}

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
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('Settings'); setShowProfileMenu(false); }}>
                        Pengaturan Profil
                      </a>
                      <a href="#" className="logout-link" onClick={(e) => { e.preventDefault(); logout(); }}>
                        Keluar Akun
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Active Tab Panel View */}
          <div className={`page-content ${activeTab === 'Board' || activeTab === 'Inbox' ? 'no-scroll' : 'scroll-y'}`}>
            {renderActiveTabContent()}
          </div>
        </main>
      </div>

      {/* --- MODALS (inside .yahya-dashboard scope) --- */}
      {modalType === 'addTask' && (
        <AddTaskModal
          onClose={() => setModalType(null)}
          onCreateTask={handleCreateTask}
          mataKuliah={mataKuliah}
        />
      )}

      {modalType === 'taskDetail' && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null)
            setModalType(null)
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Mock Invite Modal */}
      {modalType === 'invite' && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-container" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Undang Kolaborator</span>
              <X size={20} onClick={() => setModalType(null)} style={{ cursor: 'pointer' }} />
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 16 }}>
                Masukkan alamat email rekan akademis Anda untuk bergabung dengan papan tugas ini.
              </p>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, display: 'block' }}>Email Rekan</label>
              <input
                type="email"
                placeholder="rekan@mahasiswa.ac.id"
                id="invite-email"
                className="auth-input"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: '0.9rem', outline: 'none', marginBottom: 16 }}
              />
              <button
                className="btn-dark"
                style={{ width: '100%' }}
                onClick={() => handleInvite(document.getElementById('invite-email')?.value)}
              >
                Kirim Undangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {modalType === 'help' && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-container" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Bantuan & Panduan</span>
              <X size={20} onClick={() => setModalType(null)} style={{ cursor: 'pointer' }} />
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ marginBottom: 16 }}>Bagaimana cara mengelola tugas akademis Anda?</p>
              <ul style={{ listStyle: 'disc', marginLeft: 20, color: '#374151', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li>
                  Gunakan <strong>Backlog</strong> untuk melihat daftar tugas akademis yang dikelompokkan secara terstruktur.
                </li>
                <li>
                  Gunakan <strong>Board</strong> untuk menyeret dan memindahkan kartu tugas antar status secara real-time.
                </li>
                <li>
                  Buka tab <strong>Report</strong> untuk melihat distribusi statistik penyelesaian tugas.
                </li>
                <li>
                  Klik nama <strong>Mata Kuliah</strong> di bilah samping kiri untuk menyaring daftar tugas akademis berdasarkan subjek tertentu!
                </li>
              </ul>
              <button className="btn-dark" style={{ width: '100%', marginTop: 24 }} onClick={() => setModalType(null)}>Dimengerti</button>
            </div>
          </div>
        </div>
      )}

      {/* Click Outside Notifications Handler */}
      {showNotifications && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowNotifications(false)} />
      )}

      {showMataKuliahModal && (
        <MataKuliahModal
          onClose={() => setShowMataKuliahModal(false)}
          onSave={handleSaveMataKuliah}
          mataKuliahList={mataKuliah}
        />
      )}
    </div>
  )
}
