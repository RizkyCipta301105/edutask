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
import { motion } from 'framer-motion'

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
  const [showAllCourses, setShowAllCourses] = useState(false)

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
    <AppLayout showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <div className="p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-4 border-black pb-6 gap-4 bg-yellow-300 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h1 className="text-4xl font-black text-black uppercase">{role === 'umum' ? 'Tugas & Proyek' : 'Tugas Akademik'}</h1>
            <p className="font-bold text-black border-2 border-black bg-white inline-block px-3 py-1 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {role === 'umum' 
                ? 'Kelola tugas dan proyek' 
                : 'Kelola tugas kuliah'}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 self-start md:self-auto">
            {/* Horizontal pill navigation bar */}
            <div className="flex flex-wrap bg-white p-2 gap-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10">
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
                        layoutId="taskTabIndicator"
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
            
            <button 
              className="border-4 border-black bg-pink-400 px-6 py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              onClick={handleAddTask}
            >
              <Plus size={20} className="stroke-2" />
              Tambah Task
            </button>
          </div>
        </div>

        {/* Course Filter Pills */}
        {mataKuliah && mataKuliah.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6 bg-blue-300 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black text-black uppercase tracking-wider mr-2 bg-white px-2 py-1 border-2 border-black">
              {role === 'umum' ? 'Filter Agenda:' : 'Filter Kelas:'}
            </span>
            <button
              onClick={() => setSelectedCourseId(null)}
              className={`px-4 py-2 border-2 border-black font-black uppercase transition-all flex-shrink-0 ${
                selectedCourseId === null
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black hover:bg-yellow-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              Semua
            </button>
            {mataKuliah.slice(0, showAllCourses ? mataKuliah.length : 3).map(mk => (
              <button
                key={mk.id}
                onClick={() => setSelectedCourseId(prev => prev === mk.id ? null : mk.id)}
                className={`px-4 py-2 border-2 border-black font-black uppercase transition-all flex items-center gap-2 flex-shrink-0 ${
                  selectedCourseId === mk.id
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-yellow-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <span className="w-3 h-3 border border-black shadow-sm" style={{ backgroundColor: mk.warna || '#B8842A' }} />
                {mk.nama}
              </button>
            ))}
            {mataKuliah.length > 3 && (
              <button
                onClick={() => setShowAllCourses(!showAllCourses)}
                className="px-4 py-2 border-2 border-black bg-pink-200 font-black uppercase text-black hover:bg-pink-300 transition-all flex items-center gap-1 flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {showAllCourses ? 'Sembunyikan' : `+ ${mataKuliah.length - 3} Lainnya`}
              </button>
            )}
            <button
              onClick={() => setShowMataKuliahModal(true)}
              className="px-4 py-2 border-2 border-dashed border-black bg-white font-black uppercase text-black hover:bg-yellow-300 flex items-center gap-1 ml-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus size={16} className="stroke-2" /> {role === 'umum' ? 'Edit Agenda' : 'Edit Kelas'}
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
