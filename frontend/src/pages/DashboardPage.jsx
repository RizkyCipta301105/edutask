import { useState, useMemo, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Users, BarChart2, MessageSquare, Sparkles, Clock, Calendar, CheckCircle, Plus, ArrowRight, Zap } from 'lucide-react'
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
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Radial Progress Bento Card */}
      <div className="border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#00cfff] p-5 transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden">
        {/* BG pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative z-10 flex flex-col h-full">
          <h4 className="font-black uppercase flex items-center gap-2 border-[3px] border-black mb-4 text-black text-sm bg-[#FFE500] px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 self-start">
            <Sparkles size={16} className="stroke-2" />
            Progress Tugas
          </h4>
          <div className="flex-1 flex flex-col items-center justify-center">
            <svg width="130" height="130" viewBox="0 0 140 140" className="drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] max-w-[140px] w-full">
              <circle cx="70" cy="70" r={radius} className="fill-white stroke-black stroke-[5]" />
              <circle 
                cx="70" cy="70" r={radius} className="fill-transparent stroke-[#FF4D00] stroke-[18]"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 70 70)"
              />
              <text x="70" y="65" className="fill-black font-black" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '22px', fontWeight: 900 }}>
                {percentComplete}%
              </text>
              <text x="70" y="85" textAnchor="middle" style={{ fontSize: '10px', fill: '#000', fontWeight: 700 }}>SELESAI</text>
            </svg>
            <div className="mt-4 border-[3px] border-black bg-white px-4 py-2 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center rotate-1">
              <div className="text-sm font-black text-black uppercase">{completedTasks} / {totalTasks} Tugas</div>
              <div className="text-xs font-bold text-black">{pendingTasks} belum selesai</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Agenda Bento Card */}
      <div className="border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FF6B9D] p-5 transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        <div className="relative z-10 flex flex-col h-full">
          <h4 className="font-black uppercase flex items-center gap-2 border-[3px] border-black mb-4 text-black text-sm bg-white px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1 self-start">
            <Clock size={16} className="stroke-2" />
            {DAYS_NAME[todayDay]}
          </h4>
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: 'min(280px, 38vh)' }}>
            {todayClasses.length === 0 ? (
              <div className="text-center my-auto py-6 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                <span className="font-black uppercase text-black text-sm">Hari Libur!</span>
              </div>
            ) : (
              todayClasses.map(mk => (
                <div key={mk.id} className="border-[3px] border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE500] transition-colors">
                  <span className="font-black text-black uppercase block text-sm leading-tight">{mk.nama}</span>
                  {mk.jam_mulai && mk.jam_selesai && (
                    <span className="text-xs font-bold text-black block mt-1 border-t-2 border-black pt-1">
                      {mk.jam_mulai.substring(0,5)} – {mk.jam_selesai.substring(0,5)} {mk.ruangan && `| ${mk.ruangan}`}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Latest Inbox Bento Card */}
      <div 
        className="border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FFE500] p-5 transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col cursor-pointer relative overflow-hidden"
        onClick={() => {
          setActiveTab('Inbox')
          navigate(`/dashboard/${roleView}?tab=Inbox`)
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative z-10 flex flex-col h-full">
          <h4 className="font-black uppercase flex items-center gap-2 border-[3px] border-black mb-4 text-black text-sm bg-[#FF6B9D] px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1 self-start">
            <MessageSquare size={16} className="stroke-2" />
            Inbox Terbaru
          </h4>
          <div className="flex-1 flex flex-col justify-center">
            {latestThread ? (() => {
              const displayTitle = latestThread.title || latestThread.participants?.filter(p => p.id !== user.id).map(p => p.nama_lengkap).join(', ') || 'Diskusi'
              const lastMessageText = latestThread.last_message ? latestThread.last_message.text : 'Belum ada pesan'
              const getInitials = (name) => {
                if (!name) return '?'
                return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
              }
              return (
                <div className="flex items-center gap-3 bg-white border-[4px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-3 transition-transform hover:rotate-1">
                  <div className="w-12 h-12 bg-[#00cfff] border-[3px] border-black flex items-center justify-center font-black text-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                    {getInitials(displayTitle)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-black text-black uppercase text-sm truncate">
                      {displayTitle}
                    </span>
                    <span className="block text-xs font-bold text-gray-700 truncate mt-1">
                      {lastMessageText}
                    </span>
                  </div>
                  <ArrowRight size={20} className="text-black stroke-[3] flex-shrink-0" />
                </div>
              )
            })() : (
              <div className="text-center py-6 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                <span className="font-black uppercase text-black text-sm">Kosong!</span>
              </div>
            )}
            <div className="mt-4 flex items-center justify-end gap-1 text-black font-black text-xs uppercase border-t-2 border-black pt-3">
              Buka Inbox <ArrowRight size={12} className="stroke-2" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions Bento Card */}
      <div className="border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#a8ff78] p-5 transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        <div className="relative z-10 flex flex-col h-full gap-3">
          <h4 className="font-black uppercase flex items-center gap-2 border-[3px] border-black mb-2 text-black text-sm bg-white px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 self-start">
            <Zap size={16} className="stroke-2" />
            Aksi Cepat
          </h4>
          <button 
            className="w-full flex items-center justify-center gap-2 border-4 border-black bg-white px-4 py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-yellow-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            onClick={() => navigate('/tasks')}
          >
            <Plus size={20} className="stroke-2" />
            Buat Tugas Baru
          </button>
          <button 
            className="w-full flex items-center justify-center gap-2 border-4 border-black bg-white px-4 py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-pink-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            onClick={() => navigate('/schedule')}
          >
            <Calendar size={20} className="stroke-2" />
            Tambah Agenda
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
import FeatureGate from '../components/common/FeatureGate'
import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'

// Lazy load heavy components
const Report         = lazy(() => import('../components/tasks/Report'))
const RuangEdukasiList = lazy(() => import('../components/tasks/RuangEdukasiList'))
const Inbox          = lazy(() => import('../components/dashboard/Inbox'))

const TabLoading = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-4 border-black border-t-[#FF4D00] rounded-full animate-spin" />
  </div>
)

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
      baseTabs.push({ key: 'Ruang', label: 'Ruang Kelas', icon: Users })
    }
    baseTabs.push(
      { key: 'Workspace', label: 'Workspace Kolaborasi', icon: Users },
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
        return (
          <Suspense fallback={<TabLoading />}>
            <RuangEdukasiList role={roleView} user={user} isWorkspaceMode={false} />
          </Suspense>
        )
      case 'Workspace':
        return (
          <FeatureGate feature="inbox">
            <Suspense fallback={<TabLoading />}>
              <RuangEdukasiList role={roleView} user={user} isWorkspaceMode={true} />
            </Suspense>
          </FeatureGate>
        )
      case 'Report':
        return (
          <FeatureGate feature="analytics">
            <Suspense fallback={<TabLoading />}>
              <Report
                tasks={roleView === 'dosen' ? [] : (tasks || [])}
                tasksByStatus={roleView === 'dosen' ? (dosenReportData?.stats || {todo: 0, in_progress: 0, done: 0}) : (tasksByStatus || {todo: [], in_progress: [], done: []})}
                mahasiswaList={roleView === 'dosen' ? (dosenReportData?.mahasiswa || []) : []}
                tugasList={roleView === 'dosen' ? (dosenReportData?.tugas || []) : []}
                roleView={roleView}
              />
            </Suspense>
          </FeatureGate>
        )
      case 'Inbox':
        return (
          <FeatureGate feature="inbox">
            <Suspense fallback={<TabLoading />}>
              <Inbox user={user} roleView={roleView} />
            </Suspense>
          </FeatureGate>
        )
      default:
        return null
    }
  }

  return (
    <AppLayout showSearch={false}>
      <div className={`p-3 md:p-6 lg:p-8 ${activeTab === 'Inbox' ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
        <div className="relative mb-5 md:mb-8 overflow-hidden border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FF4D00]">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10 p-4 md:p-6 flex flex-col gap-4">
            <div>
              <div className="inline-block bg-black text-white font-black text-xs uppercase px-3 py-1 mb-2 -rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                {roleView === 'dosen' ? 'Dosen' : roleView === 'mahasiswa' ? 'Mahasiswa' : 'Umum'}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase leading-none tracking-tight" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
                Dashboard
              </h1>
              <div className="mt-2 border-[3px] border-black bg-white inline-block px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
                <span className="font-black text-black text-xs md:text-sm uppercase">Pantau kelas, laporan, &amp; inbox</span>
              </div>
            </div>

            {/* Tab navigation — scrollable on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="overflow-x-auto flex-1 -mx-1 px-1">
                <div className="flex border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10 min-w-max">
                {filteredTabs.map((t, idx) => {
                  const Icon = t.icon
                  const isActive = activeTab === t.key
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`relative flex items-center gap-2 px-4 md:px-5 py-3 font-black uppercase transition-all duration-150 z-10 text-[10px] md:text-sm whitespace-nowrap border-r-[3px] border-black last:border-r-0 ${
                        isActive
                          ? 'bg-[#FFE500] text-black'
                          : 'bg-white text-black hover:bg-[#FFE500]/40'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="dashboardTabIndicator"
                          className="absolute inset-0 bg-[#FFE500] z-[-1]"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      {/* Active bottom bar */}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                      )}
                      <Icon size={14} className="stroke-[2.5] relative z-10 shrink-0" />
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  )
                })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab content view */}
        <div className={`relative z-50 animate-fade-in ${activeTab === 'Inbox' ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
          {renderTabContent()}
        </div>
      </div>
    </AppLayout>
  )
}
