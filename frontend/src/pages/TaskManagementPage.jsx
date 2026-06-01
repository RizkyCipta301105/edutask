import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Columns, Briefcase, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { normalizeUserRole } from '../utils/authHelpers'
import taskService from '../services/taskService'
import AppLayout from '../components/common/AppLayout'

// Premium components
import Backlog from '../components/tasks/Backlog'
import Board from '../components/tasks/Board'
import AddTaskModal from '../components/tasks/AddTaskModal'
import TaskDetailModal from '../components/tasks/TaskDetailModal'
import MataKuliahModal from '../components/tasks/MataKuliahModal'
import DosenBroadcastView from '../components/dashboard/DosenBroadcastView'
import FeatureGate from '../components/common/FeatureGate'

const STATUS_MAP = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done'
}

export default function TaskManagementPage() {
  const { user } = useAuth()
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

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Board') // Default to Kanban Board
  const [modalType, setModalType] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  
  // Search and course filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [showMataKuliahModal, setShowMataKuliahModal] = useState(false)
  const [initialDeadline, setInitialDeadline] = useState('')

  // Open task detail or add task from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const taskId = params.get('task')
    if (taskId) {
      handleTaskClick(Number(taskId))
    }

    const shouldAdd = params.get('add') === 'true'
    const defaultDate = params.get('date')
    if (shouldAdd) {
      if (defaultDate) {
        setInitialDeadline(defaultDate)
      } else {
        setInitialDeadline('')
      }
      setModalType('addTask')
      // Clean query parameters to avoid re-opening modal on refresh/navigation
      navigate('/tasks', { replace: true })
    }
  }, [window.location.search])

  // Tabs based on role
  const filteredTabs = useMemo(() => {
    return [
      { key: 'Projects', label: role === 'dosen' ? 'Penugasan Kelas' : 'Backlog', icon: role === 'dosen' ? Briefcase : Layers },
      { key: 'Board',    label: role === 'dosen' ? 'Tugas Pribadi' : 'Kanban Board', icon: Columns },
    ]
  }, [role])

  // Handle task filtering
  const tasks = useMemo(() => {
    let flatList = [
      ...(board.todo || []),
      ...(board.in_progress || []),
      ...(board.done || [])
    ]
    
    if (selectedCourseId) {
      flatList = flatList.filter(t => {
        const mkId = t.mata_kuliah?.id ? t.mata_kuliah.id : t.mata_kuliah
        return String(mkId) === String(selectedCourseId)
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

  const handleAddTask = () => {
    setModalType('addTask')
  }

  const handleCloseModal = () => {
    setModalType(null)
    setSelectedTask(null)
  }

  const handleCreateTask = async (data) => {
    const newTask = await createTask(data)
    toast.success(`Task "${newTask.judul}" berhasil dibuat`)
    setModalType(null)
  }

  const handleUpdateTask = async (id, data) => {
    const updated = await updateTask(id, data)
    if (data.status) {
      const statusLabel = STATUS_MAP[data.status] || data.status
      toast.success(`Status task "${updated.judul}" diperbarui ke "${statusLabel}"`)
    } else {
      toast.success(`Detail task "${updated.judul}" diperbarui`)
    }
  }

  const handleMoveTask = async (taskId, overCol) => {
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
    
    try {
      await moveTask(taskId, null, overCol, 0)
      fetchBoard() 
    } catch (e) {
      console.error("Gagal memindahkan task:", e)
    }
  }

  const handleDeleteTask = async (id) => {
    const targetTask = tasks.find(t => t.id === id)
    await deleteTask(id)
    if (targetTask) {
      toast.success(`Task "${targetTask.judul}" berhasil dihapus`)
    }
    setSelectedTask(null)
    setModalType(null)
  }

  const handleSaveMataKuliah = async (payload, id) => {
    if (id) {
      await taskService.updateMataKuliah(id, payload)
    } else {
      await taskService.createMataKuliah(payload)
    }
    fetchBoard() // Refresh
  }

  const renderActiveTabContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ color: '#6b7280', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#374151', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span>Memuat data tugas akademis...</span>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'Projects':
        return role === 'dosen'
          ? (
            <FeatureGate feature="broadcast">
              <DosenBroadcastView user={user} onTaskClick={handleTaskClick} />
            </FeatureGate>
          )
          : (
            <Backlog
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
              searchQuery={searchQuery}
              roleView={role}
            />
          )
      case 'Board':
        return (
          <Board
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            onMoveTask={handleMoveTask}
            onQuickAdd={async (title, status) => {
              // deadline wajib diisi di backend — default ke hari ini
              const today = new Date().toISOString().split('T')[0]
              await createTask({ judul: title, status: status, prioritas: 'sedang', deadline: today })
            }}
            roleView={role}
          />
        )
      default:
        return null
    }
  }

  return (
    <AppLayout showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} scrollable={activeTab !== 'Board'}>
      <div className="p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-100 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{role === 'umum' ? 'Manajemen Tugas & Proyek' : 'Manajemen Tugas Akademik'}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'umum' 
                ? 'Kelola, saring, dan monitor tugas dan proyek Anda secara visual' 
                : 'Kelola, saring, dan monitor tugas kuliah Anda secara visual'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Horizontal pill navigation bar */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 border border-slate-200/50">
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
            
            <button 
              className="rounded-lg bg-[#4B3A2F] hover:bg-[#3d3025] px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm"
              onClick={handleAddTask}
            >
              <Plus size={14} />
              Tambah Task
            </button>
          </div>
        </div>

        {/* Course Filter Pills */}
        {mataKuliah && mataKuliah.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              {role === 'umum' ? 'Saring Agenda / Kategori:' : 'Saring Mata Kuliah:'}
            </span>
            <button
              onClick={() => setSelectedCourseId(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCourseId === null
                  ? 'bg-[#4B3A2F] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua
            </button>
            {mataKuliah.map(mk => (
              <button
                key={mk.id}
                onClick={() => setSelectedCourseId(prev => prev === mk.id ? null : mk.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedCourseId === mk.id
                    ? 'bg-[#4B3A2F] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mk.warna || '#B8842A' }} />
                {mk.nama}
              </button>
            ))}
            <button
              onClick={() => setShowMataKuliahModal(true)}
              className="px-3 py-1 border border-dashed border-slate-300 rounded-full text-xs font-semibold text-slate-500 hover:bg-slate-50 flex items-center gap-1 ml-auto"
            >
              {role === 'umum' ? '+ Tambah / Edit Agenda' : '+ Tambah / Edit Kelas'}
            </button>
          </div>
        )}

        {/* Render Tabbed Component */}
        <div className="animate-fade-in">
          {renderActiveTabContent()}
        </div>

      </div>

      {/* --- MODALS --- */}
      {modalType === 'addTask' && (
        <AddTaskModal
          onClose={handleCloseModal}
          onCreateTask={handleCreateTask}
          mataKuliah={mataKuliah}
          initialDeadline={initialDeadline}
        />
      )}

      {modalType === 'taskDetail' && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={handleCloseModal}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {showMataKuliahModal && (
        <MataKuliahModal
          onClose={() => setShowMataKuliahModal(false)}
          onSave={handleSaveMataKuliah}
          mataKuliahList={mataKuliah}
        />
      )}
    </AppLayout>
  )
}
