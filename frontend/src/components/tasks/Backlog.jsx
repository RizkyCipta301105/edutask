import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Filter, ArrowUpDown, BookOpen, Building2, User, CalendarDays } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PRIORITAS_COLORS = {
  tinggi: { bg: '#fef2f2', color: '#dc2626', label: 'Tinggi' },
  sedang: { bg: '#fffbeb', color: '#d97706', label: 'Sedang' },
  rendah: { bg: '#f0fdf4', color: '#16a34a', label: 'Rendah' },
}

const SECTIONS = [
  { key: 'todo',        title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done',        title: 'Done' },
]

export default function Backlog({ tasks = [], onTaskClick, onAddTask, searchQuery = '', roleView = 'umum' }) {
  const [expandedSections, setExpandedSections] = useState({
    todo: true, in_progress: true, done: false,
  })
  const [sortBy, setSortBy] = useState('default')

  const toggleSection = (key) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))

  const prioritasOrder = { tinggi: 0, sedang: 1, rendah: 2 }

  const filteredAndGroupedTasks = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim()
    
    const filtered = (tasks || []).filter(task => {
      if (!q) return true
      return task.judul?.toLowerCase().includes(q) || task.deskripsi?.toLowerCase().includes(q)
    })

    const groups = { todo: [], in_progress: [], done: [] }

    filtered.forEach(task => {
      let status = task.status
      if (status === 'in-progress') status = 'in_progress'
      if (status === 'completed') status = 'done'
      if (groups[status]) groups[status].push(task)
      else groups.todo.push(task)
    })

    // Sort setiap group berdasarkan sortBy
    const sortGroup = (list) => {
      if (sortBy === 'title') {
        return [...list].sort((a, b) => (a.judul || '').localeCompare(b.judul || '', 'id'))
      }
      if (sortBy === 'priority') {
        return [...list].sort((a, b) => (prioritasOrder[a.prioritas] ?? 3) - (prioritasOrder[b.prioritas] ?? 3))
      }
      if (sortBy === 'deadline') {
        return [...list].sort((a, b) => {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline) - new Date(b.deadline)
        })
      }
      return list
    }

    return {
      todo: sortGroup(groups.todo),
      in_progress: sortGroup(groups.in_progress),
      done: sortGroup(groups.done),
    }
  }, [tasks, searchQuery, sortBy])

  const renderSection = (key, title) => {
    const sectionTasks = filteredAndGroupedTasks[key] || []
    
    return (
      <div key={key} className="mb-6 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div 
          className={`flex justify-between items-center p-4 bg-yellow-300 cursor-pointer hover:bg-yellow-400 transition-colors ${expandedSections[key] ? 'border-b-4 border-black' : ''}`}
          onClick={() => toggleSection(key)}
        >
          <div className="font-black text-black uppercase flex items-center gap-2 text-lg">
            {expandedSections[key] ? <ChevronDown size={24} className="stroke-2" /> : <ChevronRight size={24} className="stroke-2" />}
            {title} <span className="bg-white border-2 border-black px-2 py-0.5 text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{sectionTasks.length} TASKS</span>
          </div>
          <div className="flex items-center gap-3 text-black">
            <Plus size={24} className="stroke-2 hover:scale-110 cursor-pointer" onClick={(e) => { e.stopPropagation(); onAddTask(); }} />
            <MoreHorizontal size={24} className="stroke-2 cursor-pointer" />
          </div>
        </div>
        <AnimatePresence initial={false}>
          {expandedSections[key] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col p-4 bg-blue-100 gap-3">
                {sectionTasks.length === 0 && (
                  <div className="text-center font-black text-black border-4 border-dashed border-black p-4 bg-white/50 uppercase">
                    BELUM ADA TASK DI SECTION INI
                  </div>
                )}
                {sectionTasks.map(task => {
                  const p = PRIORITAS_COLORS[task.prioritas] || PRIORITAS_COLORS.sedang
                  return (
                    <div key={task.id} className="flex justify-between items-center bg-white border-4 border-black p-4 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform" onClick={() => onTaskClick(task.id)}>
                      <div>
                        <div className="font-black text-black uppercase">{task.judul}</div>
                        {task.mata_kuliah_detail?.nama && (
                          <div className="flex items-center gap-1 font-black text-black text-sm mt-1 uppercase">
                            <BookOpen size={13} className="stroke-2" /> {task.mata_kuliah_detail.nama}
                          </div>
                        )}
                        {task.workspace_detail?.nama_ruang && (
                          <div className="flex items-center gap-1 font-black text-black text-sm mt-1 uppercase">
                            <Building2 size={13} className="stroke-2" /> {task.workspace_detail.nama_ruang}
                          </div>
                        )}
                        {!task.mata_kuliah_detail && !task.workspace_detail && (
                          <div className="flex items-center gap-1 font-black text-black text-sm mt-1 uppercase text-gray-600">
                            <User size={13} className="stroke-2" /> PRIBADI
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase" style={{ background: p.bg, color: 'black' }}>
                          {p.label}
                        </span>
                        {task.deadline && (
                          <span className="flex items-center gap-1 text-xs font-black px-2 py-1 border-2 border-black bg-pink-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                            <CalendarDays size={11} className="stroke-2" /> {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-4 bg-green-400 border-t-4 border-black font-black uppercase text-center cursor-pointer hover:bg-green-500 transition-colors" onClick={onAddTask}>
                <Plus size={20} className="inline-block stroke-2 mr-2" /> TAMBAH TASK
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b-4 border-black pb-4">
        <div className="font-black text-2xl uppercase flex items-center gap-2 bg-yellow-300 border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          {roleView === 'dosen' ? 'Daftar Evaluasi / Tugas' : (roleView === 'mahasiswa' ? 'Daftar Pekerjaan Kuliah' : 'Daftar Pekerjaan')}
          <ChevronDown size={24} className="stroke-2 text-black" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            className={`flex items-center gap-2 px-3 py-2 border-4 border-black font-black uppercase cursor-pointer transition-all hover:bg-yellow-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${sortBy === 'priority' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'}`}
            onClick={() => setSortBy(prev => prev === 'priority' ? 'default' : 'priority')}
          >
            <Filter size={18} className="stroke-2" /> <span>Sort Prioritas</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 px-3 py-2 border-4 border-black font-black uppercase cursor-pointer transition-all hover:bg-pink-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${sortBy === 'title' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'}`}
            onClick={() => setSortBy(prev => prev === 'title' ? 'default' : 'title')}
          >
            <ArrowUpDown size={18} className="stroke-2" />
            <span>Sort Judul</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 px-3 py-2 border-4 border-black font-black uppercase cursor-pointer transition-all hover:bg-blue-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${sortBy === 'deadline' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'}`}
            onClick={() => setSortBy(prev => prev === 'deadline' ? 'default' : 'deadline')}
          >
            <CalendarDays size={18} className="stroke-2" />
            <span>Sort Deadline</span>
          </button>
        </div>
      </div>

      {SECTIONS.map(({ key, title }) => renderSection(key, title))}
    </div>
  )
}
