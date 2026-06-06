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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Radial Progress Bento Card */}
      <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-[#0ea5e9] p-6 transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        <h4 className="font-black uppercase flex items-center gap-2 border-b-4 border-black pb-2 mb-4 text-black text-lg bg-white p-2 border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          <Sparkles size={20} className="stroke-2" />
          Progress Tugas
        </h4>
        <div className="flex-1 flex flex-col items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <circle cx="70" cy="70" r={radius} className="fill-white stroke-black stroke-[4]" />
            <circle 
              cx="70" cy="70" r={radius} className="fill-transparent stroke-yellow-300 stroke-[16]"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 70 70)"
            />
            <text x="70" y="70" className="fill-black font-black text-3xl" textAnchor="middle" dominantBaseline="middle">
              {percentComplete}%
            </text>
          </svg>
          <div className="text-center mt-6 border-2 border-black bg-white p-2 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm font-black text-black">{completedTasks} / {totalTasks} SELESAI</div>
          </div>
        </div>
      </div>

      {/* 2. Today's Agenda Bento Card */}
      <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-pink-300 p-6 transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        <h4 className="font-black uppercase flex items-center gap-2 border-b-4 border-black pb-2 mb-4 text-black text-lg bg-white p-2 border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
          <Clock size={20} className="stroke-2" />
          Jadwal ({DAYS_NAME[todayDay]})
        </h4>
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2" style={{ maxHeight: 300 }}>
          {todayClasses.length === 0 ? (
            <div className="text-center my-auto py-8 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-black uppercase text-black">Libur!</span>
            </div>
          ) : (
            todayClasses.map(mk => (
              <div key={mk.id} className="border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100 transition-colors">
                <span className="font-black text-black uppercase block">{mk.nama}</span>
                {mk.jam_mulai && mk.jam_selesai && (
                  <span className="text-sm font-bold text-black block mt-2 border-t-2 border-black pt-1">
                    {mk.jam_mulai.substring(0,5)} - {mk.jam_selesai.substring(0,5)} {mk.ruangan && `| 📍 ${mk.ruangan}`}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Latest Inbox Bento Card */}
      <div 
        className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-yellow-300 p-6 transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col cursor-pointer"
        onClick={() => {
          setActiveTab('Inbox')
          navigate(`/dashboard/${roleView}?tab=Inbox`)
        }}
      >
        <h4 className="font-black uppercase flex items-center gap-2 border-b-4 border-black pb-2 mb-4 text-black text-lg bg-white p-2 border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          <MessageSquare size={20} className="stroke-2" />
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
              <div className="flex items-center gap-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 transition-transform hover:rotate-1">
                <div className="w-12 h-12 bg-blue-400 border-2 border-black flex items-center justify-center font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                  {getInitials(displayTitle)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-black text-black uppercase truncate">
                    {displayTitle}
                  </span>
                  <span className="block text-sm font-bold text-gray-700 truncate mt-1">
                    {lastMessageText}
                  </span>
                </div>
                <ArrowRight size={24} className="text-black stroke-2 flex-shrink-0" />
              </div>
            )
          })() : (
            <div className="text-center py-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-black uppercase text-black">Kosong!</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Quick Actions Bento Card */}
      <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-green-400 p-6 transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        <h4 className="font-black uppercase flex items-center gap-2 border-b-4 border-black pb-2 mb-4 text-black text-lg bg-white p-2 border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
          <Calendar size={20} className="stroke-2" />
          Aksi Cepat
        </h4>
        <div className="flex flex-col gap-4 mt-2">
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

// Components
import Report from '../components/tasks/Report'
import RuangEdukasiList from '../components/tasks/RuangEdukasiList'
import Inbox from '../components/dashboard/Inbox'
import FeatureGate from '../components/common/FeatureGate'
import { motion } from 'framer-motion'

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
          <FeatureGate feature="ruang_edukasi">
            <RuangEdukasiList role={roleView} user={user} isWorkspaceMode={false} />
          </FeatureGate>
        )
      case 'Workspace':
        return (
          <FeatureGate feature="inbox">
            <RuangEdukasiList role={roleView} user={user} isWorkspaceMode={true} />
          </FeatureGate>
        )
      case 'Report':
        return (
          <FeatureGate feature="analytics">
            <Report
              tasks={roleView === 'dosen' ? [] : (tasks || [])}
              tasksByStatus={roleView === 'dosen' ? (dosenReportData?.stats || {todo: 0, in_progress: 0, done: 0}) : (tasksByStatus || {todo: [], in_progress: [], done: []})}
              mahasiswaList={roleView === 'dosen' ? (dosenReportData?.mahasiswa || []) : []}
              tugasList={roleView === 'dosen' ? (dosenReportData?.tugas || []) : []}
              roleView={roleView}
            />
          </FeatureGate>
        )
      case 'Inbox':
        return (
          <FeatureGate feature="inbox">
            <Inbox user={user} roleView={roleView} />
          </FeatureGate>
        )
      default:
        return null
    }
  }

  return (
    <AppLayout showSearch={false}>
      <div className={`p-8 ${activeTab === 'Inbox' ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-4 border-black pb-6 gap-4 bg-yellow-300 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h1 className="text-4xl font-black text-black uppercase">Dashboard</h1>
            <p className="font-bold text-black border-2 border-black bg-white inline-block px-3 py-1 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Pantau kelas, laporan, & inbox</p>
          </div>
          
          {/* Horizontal pill navigation bar */}
          <div className="flex flex-wrap bg-white p-2 gap-2 border-4 border-black self-start md:self-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10">
            {filteredTabs.map(t => {
              const Icon = t.icon
              const isActive = activeTab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`relative flex items-center gap-2 px-4 py-2 font-black uppercase transition-all duration-200 z-10 ${
                    isActive 
                      ? 'text-white translate-x-[1px] translate-y-[1px]' 
                      : 'border-2 border-black bg-white text-black hover:bg-yellow-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dashboardTabIndicator"
                      className="absolute inset-0 bg-[#ea580c] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-[-1]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className="stroke-2 relative z-10" />
                  <span className="relative z-10">{t.label}</span>
                </button>
              )
            })}
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
