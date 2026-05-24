import { useState, useMemo, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Users, BarChart2, MessageSquare, Sparkles, Clock, Calendar, CheckCircle, Plus, ArrowRight } from 'lucide-react'
import inboxService from '../services/inboxService'
import taskService from '../services/taskService'

function DashboardOverview({ tasks, mataKuliah, latestThread, user, roleView, navigate, setActiveTab }) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed').length
  const pendingTasks = totalTasks - completedTasks
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  // Circular progress stroke logic Y = 2 * PI * R
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentComplete / 100) * circumference

  // Today's classes
  const todayDay = new Date().getDay() // 0 = Minggu, 1 = Senin, etc.
  const todayClasses = useMemo(() => {
    return mataKuliah.filter(mk => mk.hari !== null && Number(mk.hari) === todayDay)
  }, [mataKuliah, todayDay])

  const DAYS_NAME = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

  return (
    <div className="bento-grid">
      {/* 1. Radial Progress Bento Card */}
      <div className="bento-card bento-card-radial">
        <h4 className="bento-card-title">
          <Sparkles size={16} className="text-[#B8842A]" />
          Progress Tugas Anda
        </h4>
        <div className="radial-progress-container">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} className="circle-bg" />
            <circle 
              cx="70" cy="70" r={radius} className="circle-progress"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 70 70)"
            />
            <text x="70" y="70" className="circle-text">
              {percentComplete}%
            </text>
          </svg>
          <div className="text-center mt-4">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{completedTasks} dari {totalTasks} Tugas Selesai</div>
            <div className="text-xs text-slate-400 mt-1">{pendingTasks} tugas masih berjalan</div>
          </div>
        </div>
      </div>

      {/* 2. Today's Agenda Bento Card */}
      <div className="bento-card bento-card-agenda">
        <h4 className="bento-card-title">
          <Clock size={16} className="text-[#B8842A]" />
          Jadwal Hari Ini ({DAYS_NAME[todayDay]})
        </h4>
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: 300 }}>
          {todayClasses.length === 0 ? (
            <div className="text-center my-auto py-8">
              <span className="text-xs text-slate-400 font-medium italic">Tidak ada jadwal kuliah/kegiatan hari ini</span>
            </div>
          ) : (
            todayClasses.map(mk => (
              <div key={mk.id} className="border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1 relative" style={{ borderLeft: `4px solid ${mk.warna || '#B8842A'}` }}>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{mk.nama}</span>
                {mk.jam_mulai && mk.jam_selesai && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    🕒 {mk.jam_mulai.substring(0,5)} - {mk.jam_selesai.substring(0,5)} {mk.ruangan && `| 📍 ${mk.ruangan}`}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Latest Inbox Bento Card */}
      <div 
        className="bento-card bento-card-inbox group cursor-pointer hover:border-[#B8842A] hover:shadow-lg transition-all duration-300"
        onClick={() => {
          setActiveTab('Inbox')
          navigate(`/dashboard/${roleView}?tab=Inbox`)
        }}
      >
        <h4 className="bento-card-title transition-colors group-hover:text-[#B8842A]">
          <MessageSquare size={16} className="text-[#B8842A] transition-transform group-hover:scale-110" />
          Inbox Kolaborasi Terbaru
        </h4>
        <div className="flex-1 flex flex-col justify-center">
          {latestThread ? (() => {
            const displayTitle = latestThread.title || latestThread.participants?.filter(p => p.id !== user.id).map(p => p.nama_lengkap).join(', ') || 'Diskusi Kolaborasi'
            const lastMessageText = latestThread.last_message ? latestThread.last_message.text : 'Belum ada pesan'
            const getInitials = (name) => {
              if (!name) return '?'
              return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
            }
            return (
              <div className="bento-inbox-snippet flex items-center gap-4 p-3.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100/70 dark:border-amber-900/30 rounded-2xl transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm border border-amber-200/50 dark:border-amber-800/30 shadow-sm flex-shrink-0">
                  {getInitials(displayTitle)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-xs text-amber-900 dark:text-amber-200 truncate">
                    {displayTitle}
                  </span>
                  <span className="block text-[11px] text-amber-700/80 dark:text-amber-400 truncate mt-0.5">
                    {lastMessageText}
                  </span>
                </div>
                <ArrowRight size={16} className="text-amber-700/80 dark:text-amber-400 flex-shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            )
          })() : (
            <span className="text-xs text-slate-400 font-medium italic text-center py-4">Belum ada percakapan inbox</span>
          )}
        </div>
      </div>

      {/* 4. Quick Actions Bento Card */}
      <div className="bento-card bento-card-quick">
        <h4 className="bento-card-title">
          <Calendar size={16} className="text-[#B8842A]" />
          Pintasan Aksi Cepat
        </h4>
        <div className="bento-quick-btn-grid">
          <button className="bento-quick-btn" onClick={() => navigate('/tasks')}>
            <Plus size={14} className="text-[#B8842A]" />
            Buat Tugas Baru
          </button>
          <button className="bento-quick-btn" onClick={() => navigate('/schedule')}>
            <Calendar size={14} className="text-[#B8842A]" />
            Tambah Agenda Baru
          </button>
        </div>
      </div>
    </div>
  )
}

import { useAuth } from '../context/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'
import AppLayout from '../components/common/AppLayout'

// Components
import Report from '../components/tasks/Report'
import RuangEdukasiList from '../components/tasks/RuangEdukasiList'
import Inbox from '../components/dashboard/Inbox'

export default function DashboardPage({ roleView = null }) {
  const { user } = useAuth()
  const role = normalizeUserRole(user)
  const { board, loading } = useTasks()
  const navigate = useNavigate()

  // Handle activeTab from query param or default to 'Overview'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') || 'Overview'
  })

  // State khusus Dosen untuk report data lengkap
  const [dosenReportData, setDosenReportData] = useState(null)

  // Dynamic Bento Data states
  const [latestThread, setLatestThread] = useState(null)
  const [mataKuliah, setMataKuliah] = useState([])

  // Fetch threads and schedules on mount for Bento Grid
  useEffect(() => {
    inboxService.getThreads()
      .then(threads => {
        if (threads && threads.length > 0) {
          setLatestThread(threads[0])
        }
      })
      .catch(console.error)

    taskService.getMataKuliah()
      .then(data => setMataKuliah(data || []))
      .catch(console.error)
  }, [])

  // Synchronize tab state from query parameter changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [window.location.search])

  // Mengambil Rekap Report Dosen saat tab Report dibuka
  useEffect(() => {
    if (roleView === 'dosen') {
      taskService.getDosenReport()
        .then(res => {
          if (res) {
            setDosenReportData(res)
          }
        })
        .catch(err => console.error("Gagal memuat report dosen:", err))
    }
  }, [roleView, activeTab])

  // Redirect if role is invalid or mismatched
  if (!roleView || roleView !== role) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }

  // Handle task filtering for student/umum report view
  const tasks = useMemo(() => {
    return [
      ...(board.todo || []),
      ...(board.in_progress || []),
      ...(board.done || [])
    ]
  }, [board])

  const tasksByStatus = useMemo(() => {
    const groups = { todo: [], in_progress: [], done: [] }
    tasks.forEach(t => {
      let status = t.status
      if (status === 'in-progress' || status === 'in_progress') status = 'in_progress'
      if (status === 'completed' || status === 'done') status = 'done'

      if (groups[status]) {
        groups[status].push(t)
      } else {
        groups.todo.push(t)
      }
    })
    return groups
  }, [tasks])

  const filteredTabs = useMemo(() => {
    const baseTabs = [
      { key: 'Overview', label: 'Overview Ringkas', icon: Sparkles },
    ]
    if (roleView !== 'umum') {
      baseTabs.push({ key: 'Ruang', label: 'Ruang Edukasi', icon: Users })
    }
    baseTabs.push(
      { key: 'Report',   label: 'Laporan Performa',   icon: BarChart2 },
      { key: 'Inbox',    label: 'Inbox Diskusi',    icon: MessageSquare }
    )
    return baseTabs
  }, [roleView])

  const renderTabContent = () => {
    if (loading && activeTab === 'Report' && roleView !== 'dosen') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ color: '#6b7280', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#374151', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span>Memuat laporan performa akademis...</span>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'Overview':
        return (
          <DashboardOverview 
            tasks={tasks}
            mataKuliah={mataKuliah}
            latestThread={latestThread}
            user={user}
            roleView={roleView}
            navigate={navigate}
            setActiveTab={setActiveTab}
          />
        )
      case 'Ruang':
        return <RuangEdukasiList role={roleView} />
      case 'Report':
        return (
          <Report
            tasks={roleView === 'dosen' ? [] : (tasks || [])}
            tasksByStatus={roleView === 'dosen' ? (dosenReportData?.stats || {todo: 0, in_progress: 0, done: 0}) : (tasksByStatus || {todo: [], in_progress: [], done: []})}
            mahasiswaList={roleView === 'dosen' ? (dosenReportData?.mahasiswa || []) : []}
            tugasList={roleView === 'dosen' ? (dosenReportData?.tugas || []) : []}
            roleView={roleView}
          />
        )
      case 'Inbox':
        return <Inbox user={user} roleView={roleView} />
      default:
        return null
    }
  }

  return (
    <AppLayout scrollable={activeTab !== 'Inbox'}>
      <div className={`p-8 ${activeTab === 'Inbox' ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-100 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Utama</h1>
            <p className="text-xs text-slate-500 mt-1">Pantau ruang kelas, laporan performa akademis, dan inbox kolaborasi Anda</p>
          </div>
          
          {/* Horizontal pill navigation bar */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 border border-slate-200/50 self-start md:self-auto">
            {filteredTabs.map(t => {
              const Icon = t.icon
              const isActive = activeTab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content view */}
        <div className={`animate-fade-in ${activeTab === 'Inbox' ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
          {renderTabContent()}
        </div>
      </div>
    </AppLayout>
  )
}
