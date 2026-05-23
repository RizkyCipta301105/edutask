import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Filter, ArrowUpDown } from 'lucide-react'

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
    
    // Filter tasks based on search query (judul or deskripsi)
    const filtered = (tasks || []).filter(task => {
      if (!q) return true
      const judulMatch = task.judul?.toLowerCase().includes(q)
      const deskripsiMatch = task.deskripsi?.toLowerCase().includes(q)
      return judulMatch || deskripsiMatch
    })

    // Group tasks by status internally
    const groups = {
      todo: [],
      in_progress: [],
      done: [],
    }

    filtered.forEach(task => {
      let status = task.status
      if (status === 'in-progress') status = 'in_progress'
      if (status === 'completed') status = 'done'

      if (groups[status]) {
        groups[status].push(task)
      } else {
        groups.todo.push(task) // default fallback
      }
    })

    return groups
  }, [tasks, searchQuery])

  const sortTasks = (taskList) => {
    if (sortBy === 'title') {
      return [...taskList].sort((a, b) => (a.judul || '').localeCompare(b.judul || ''))
    }
    if (sortBy === 'priority') {
      return [...taskList].sort((a, b) =>
        (prioritasOrder[a.prioritas] ?? 3) - (prioritasOrder[b.prioritas] ?? 3)
      )
    }
    return taskList
  }

  const renderSection = (key, title) => {
    const sectionTasks = sortTasks(filteredAndGroupedTasks[key] || [])
    
    return (
      <div key={key}>
        <div className="section-header" onClick={() => toggleSection(key)}>
          <div className="section-title">
            {expandedSections[key] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            {title} <span className="task-count">{sectionTasks.length} tasks</span>
          </div>
          <div className="section-actions">
            <Plus size={18} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onAddTask(); }} />
            <MoreHorizontal size={18} style={{ cursor: 'pointer' }} />
          </div>
        </div>
        {expandedSections[key] && (
          <>
            <div className="task-list-container">
              {sectionTasks.length === 0 && (
                <div style={{ padding: 16, color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center' }}>
                  Belum ada task di section ini
                </div>
              )}
              {sectionTasks.map(task => {
                const p = PRIORITAS_COLORS[task.prioritas] || PRIORITAS_COLORS.sedang
                return (
                  <div key={task.id} className="task-row" onClick={() => onTaskClick(task.id)}>
                    <div className="task-info">
                      <div className="task-title">{task.judul}</div>
                      {task.mata_kuliah_detail?.nama && (
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          📚 {task.mata_kuliah_detail.nama}
                        </div>
                      )}
                    </div>
                    <div className="task-labels">
                      <span className="label" style={{ background: p.bg, color: p.color }}>
                        {p.label}
                      </span>
                      {task.deadline && (
                        <span className="label" style={{ background: '#f3f4f6', color: '#374151' }}>
                          📅 {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="add-task-inline" onClick={onAddTask}>
              <Plus size={16} /> Tambah task
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="yd-backlog">
      <div className="page-header">
        <div className="page-title">
          {roleView === 'dosen' ? 'Daftar Evaluasi / Tugas' : (roleView === 'mahasiswa' ? 'Daftar Pekerjaan Kuliah' : 'Daftar Pekerjaan')}
          <ChevronDown size={20} color="#111827" />
        </div>
        <div className="page-controls">
          <div
            className={`control-item ${sortBy === 'priority' ? 'active-filter' : ''}`}
            onClick={() => setSortBy(prev => prev === 'priority' ? 'default' : 'priority')}
          >
            <Filter size={16} /> <span className="control-label">Sort Prioritas</span>
          </div>
          <div
            className={`control-item ${sortBy === 'title' ? 'active-filter' : ''}`}
            onClick={() => setSortBy(prev => prev === 'title' ? 'default' : 'title')}
          >
            <ArrowUpDown size={16} />
            <span className="control-label">Sort Judul</span>
          </div>
        </div>
      </div>

      {SECTIONS.map(({ key, title }) => renderSection(key, title))}
    </div>
  )
}
