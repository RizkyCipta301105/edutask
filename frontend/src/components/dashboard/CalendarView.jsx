import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Clock, AlertTriangle, CheckCircle, Plus, Sparkles } from 'lucide-react'
import { DndContext, useDraggable, useDroppable, DragOverlay, pointerWithin } from '@dnd-kit/core'

function DroppableCalendarCell({ dateString, isToday, isSelected, hoveredDateStr, setHoveredDateStr, setSelectedDateStr, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: dateString,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isOver ? 'ring-2 ring-[#B8842A] bg-amber-50' : ''}`}
      onClick={() => setSelectedDateStr(dateString)}
      onMouseEnter={() => setHoveredDateStr(dateString)}
      onMouseLeave={() => setHoveredDateStr(null)}
    >
      {children}
    </div>
  )
}

function DraggableTaskCard({ task, onTaskClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'Task', task }
  });

  const isDone = task.status === 'done' || task.status === 'completed'
  const isInProgress = task.status === 'in_progress' || task.status === 'in-progress'
  
  let statusLabel = 'To Do'
  let badgeClass = 'todo'
  if (isDone) {
    statusLabel = 'Done'
    badgeClass = 'done'
  } else if (isInProgress) {
    statusLabel = 'In Progress'
    badgeClass = 'progress'
  }

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`agenda-task-card ${isDone ? 'done' : ''} ${isDragging ? 'opacity-50 border-dashed border-[#B8842A]' : ''} cursor-grab active:cursor-grabbing`}
      onClick={() => onTaskClick && onTaskClick(task.id)}
    >
      <div className="task-card-main">
        <span className="task-title">{task.judul}</span>
        <span className={`task-status-badge ${badgeClass}`}>
          {statusLabel}
        </span>
      </div>
      {task.mata_kuliah_detail?.nama && (
        <span className="task-course-tag">
          {task.mata_kuliah_detail.nama}
        </span>
      )}
    </div>
  )
}

function TaskDragOverlay({ task }) {
  const isDone = task.status === 'done' || task.status === 'completed'
  const isInProgress = task.status === 'in_progress' || task.status === 'in-progress'
  
  let statusLabel = 'To Do'
  let badgeClass = 'todo'
  if (isDone) {
    statusLabel = 'Done'
    badgeClass = 'done'
  } else if (isInProgress) {
    statusLabel = 'In Progress'
    badgeClass = 'progress'
  }

  return (
    <div className={`agenda-task-card ${isDone ? 'done' : ''} opacity-95 shadow-xl border-[#B8842A] rotate-3 cursor-grabbing scale-105 bg-white`}>
      <div className="task-card-main">
        <span className="task-title">{task.judul}</span>
        <span className={`task-status-badge ${badgeClass}`}>
          {statusLabel}
        </span>
      </div>
      {task.mata_kuliah_detail?.nama && (
        <span className="task-course-tag">
          {task.mata_kuliah_detail.nama}
        </span>
      )}
    </div>
  )
}

export default function CalendarView({ 
  tasks = [], 
  mataKuliah = [], 
  onTaskClick, 
  onDateClick, 
  onTaskMove,
  roleView = 'umum' 
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTask, setActiveTask] = useState(null)
  
  // Format today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  const [selectedDateStr, setSelectedDateStr] = useState(todayStr)
  const [hoveredDateStr, setHoveredDateStr] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  // Map tasks to their deadline dates (YYYY-MM-DD string) - O(N) single-pass
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      if (t.deadline) {
        // deadline format is YYYY-MM-DD
        const datePart = t.deadline.split('T')[0]
        if (!map[datePart]) map[datePart] = []
        map[datePart].push(t)
      }
    })
    return map
  }, [tasks])

  // Memoize events and classes specifically for the SELECTED date to maintain maximum rendering performance
  const selectedDateEvents = useMemo(() => {
    const parts = selectedDateStr.split('-')
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    const dayOfWeek = isNaN(dateObj.getTime()) ? -1 : dateObj.getDay()
    
    // 0 = Minggu, 1 = Senin, 2 = Selasa, etc.
    const classes = (mataKuliah || []).filter(mk => {
      const matchesDay = mk.hari !== null && mk.hari !== undefined && Number(mk.hari) === dayOfWeek
      if (!matchesDay) return false

      if (mk.created_at && !isNaN(dateObj.getTime())) {
        const compareCell = new Date(dateObj)
        compareCell.setHours(0,0,0,0)
        const compareCreated = new Date(mk.created_at)
        compareCreated.setHours(0,0,0,0)
        return compareCell >= compareCreated
      }
      return true
    })
    const dayTasks = tasksByDate[selectedDateStr] || []
    
    return { classes, tasks: dayTasks, dateObj }
  }, [selectedDateStr, mataKuliah, tasksByDate])

  const formattedSelectedDate = useMemo(() => {
    const { dateObj } = selectedDateEvents
    if (isNaN(dateObj.getTime())) return 'Pilih Tanggal'
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const dayName = days[dateObj.getDay()]
    const dayNum = dateObj.getDate()
    const monthName = monthNames[dateObj.getMonth()]
    const yearNum = dateObj.getFullYear()
    
    return `${dayName}, ${dayNum} ${monthName} ${yearNum}`
  }, [selectedDateEvents])

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(active.data.current?.task);
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (over && active.id) {
      const taskId = active.id;
      const newDateStr = over.id; // Target date string YYYY-MM-DD
      
      // Prevent dropping on the same day
      if (newDateStr === selectedDateStr) return;
      
      if (onTaskMove) {
        onTaskMove(taskId, newDateStr);
      }
    }
  }

  const renderCells = () => {
    const cells = []
    
    // Empty cells for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>)
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const yyyy = year
      const mm = String(month + 1).padStart(2, '0')
      const dd = String(i).padStart(2, '0')
      const dateString = `${yyyy}-${mm}-${dd}`

      const dayTasks = tasksByDate[dateString] || []
      const isToday = todayStr === dateString
      const isSelected = selectedDateStr === dateString
      
      const cellDate = new Date(year, month, i)
      const currentDayOfWeek = cellDate.getDay()
      const dayClasses = (mataKuliah || []).filter(mk => {
        const matchesDay = mk.hari !== null && mk.hari !== undefined && Number(mk.hari) === currentDayOfWeek
        if (!matchesDay) return false

        if (mk.created_at) {
          const compareCell = new Date(year, month, i)
          compareCell.setHours(0,0,0,0)
          const compareCreated = new Date(mk.created_at)
          compareCreated.setHours(0,0,0,0)
          return compareCell >= compareCreated
        }
        return true
      })

      // Count tasks categories for indicator dots
      const hasClasses = dayClasses.length > 0
      const hasPendingTasks = dayTasks.some(t => t.status !== 'done' && t.status !== 'completed')
      const hasCompletedTasks = dayTasks.some(t => t.status === 'done' || t.status === 'completed')

      cells.push(
        <DroppableCalendarCell 
          key={i} 
          dateString={dateString}
          isToday={isToday}
          isSelected={isSelected}
          hoveredDateStr={hoveredDateStr}
          setHoveredDateStr={setHoveredDateStr}
          setSelectedDateStr={setSelectedDateStr}
        >
          <span className="calendar-date-number">{i}</span>
          
          {/* Minimalist modern event indicator dots */}
          <div className="calendar-dot-indicators">
             {hasClasses && <span className="dot-indicator class" title={`${dayClasses.length} ${roleView === 'umum' ? 'Jadwal Kegiatan' : 'Jadwal Kuliah'}`} />}
             {hasPendingTasks && <span className="dot-indicator pending-task" title="Tugas Belum Selesai" />}
             {hasCompletedTasks && <span className="dot-indicator done-task" title="Tugas Selesai" />}
          </div>

          {/* Floating Hover Popover Preview */}
          {hoveredDateStr === dateString && (dayClasses.length > 0 || dayTasks.length > 0) && (
            <div className="calendar-hover-popover z-[100]">
              {dayClasses.slice(0, 3).map(mk => (
                <div key={mk.id} className="calendar-popover-item" style={{ borderLeft: `3px solid ${mk.warna || '#B8842A'}`, background: '#f8fafc', color: '#1e293b' }}>
                  🕒 {mk.nama}
                </div>
              ))}
              {dayTasks.slice(0, 3).map(t => (
                <div key={t.id} className="calendar-popover-item" style={{ borderLeft: '3px solid #f59e0b', background: '#fffbeb', color: '#b45309' }}>
                  📅 {t.judul}
                </div>
              ))}
              {(dayClasses.length > 3 || dayTasks.length > 3) && (
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: 2 }}>
                  + {dayClasses.length + dayTasks.length - 6} agenda lainnya
                </div>
              )}
            </div>
          )}
        </DroppableCalendarCell>
      )
    }

    return cells
  }

  const calendarTitle = roleView === 'dosen' 
    ? 'Kalender Mengajar & Penugasan' 
    : (roleView === 'mahasiswa' ? 'Jadwal Kuliah & Deadline' : 'Kalender Produktivitas Pribadi')

  return (
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="premium-calendar-wrapper">
        <div className="calendar-main-layout">
          
          {/* PANEL KIRI: KALENDER GRID */}
          <div className="calendar-grid-panel">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="text-[#B8842A]" size={22} />
                  {calendarTitle}
                </h1>
                 <p className="text-xs text-slate-500 mt-1">
                   {roleView === 'umum' 
                     ? 'Kelola jadwal kegiatan dan tugas secara visual' 
                     : 'Kelola jadwal kuliah dan tugas secara visual'}
                 </p>
              </div>
            </div>

            <div className="calendar-navigation-header">
              <button onClick={prevMonth} className="nav-arrow-btn">
                <ChevronLeft size={18}/>
              </button>
              <h2 className="month-year-label">{monthNames[month]} {year}</h2>
              <button onClick={nextMonth} className="nav-arrow-btn">
                <ChevronRight size={18}/>
              </button>
            </div>

            <div className="calendar-grid-container relative">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                <div key={d} className="calendar-day-label">{d}</div>
              ))}
              {renderCells()}
            </div>
          </div>

          {/* PANEL KANAN: SIDEBAR DETAIL AGENDA */}
          <div className="calendar-detail-sidebar">
            <div className="sidebar-date-header">
              <Sparkles size={16} className="text-[#B8842A]" />
              <h3 className="sidebar-date-title">{formattedSelectedDate}</h3>
              {selectedDateStr === todayStr && (
                <span className="today-badge">Hari Ini</span>
              )}
            </div>

            <div className="sidebar-actions">
              <button 
                onClick={() => onDateClick && onDateClick(selectedDateStr)}
                className="quick-add-task-btn"
              >
                <Plus size={16} />
                Tambah Tugas Hari Ini
              </button>
            </div>

            <div className="agenda-scroll-container">
              
              {/* 1. SEKTOR JADWAL KULIAH */}
              <div className="agenda-section">
                <h4 className="agenda-section-title">
                  <BookOpen size={14} />
                  {roleView === 'umum' ? 'Jadwal Kegiatan & Agenda' : 'Jadwal Kuliah & Kelas'}
                </h4>
                {selectedDateEvents.classes.length === 0 ? (
                  <div className="agenda-empty-state">
                    {roleView === 'umum' ? 'Tidak ada jadwal kegiatan hari ini.' : 'Tidak ada jadwal kuliah hari ini.'}
                  </div>
                ) : (
                  <div className="agenda-list">
                    {selectedDateEvents.classes.map(mk => (
                      <div 
                        key={mk.id} 
                        className="agenda-class-card"
                        style={{ borderLeftColor: mk.warna || '#B8842A' }}
                      >
                        <div className="class-card-header">
                          <span className="class-name">{mk.nama}</span>
                          {mk.ruangan && (
                            <span className="class-room">{mk.ruangan}</span>
                          )}
                        </div>
                        {mk.jam_mulai && mk.jam_selesai && (
                          <div className="class-time">
                            <Clock size={12} />
                            {mk.jam_mulai.substring(0, 5)} - {mk.jam_selesai.substring(0, 5)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. SEKTOR TENGGAT TUGAS */}
              <div className="agenda-section mt-6">
                <h4 className="agenda-section-title">
                  <CheckCircle size={14} />
                  Tenggat Waktu Tugas
                </h4>
                {selectedDateEvents.tasks.length === 0 ? (
                  <div className="agenda-empty-state">
                    Tidak ada deadline tugas hari ini.
                  </div>
                ) : (
                  <div className="agenda-list">
                    {selectedDateEvents.tasks.map(t => (
                      <DraggableTaskCard key={t.id} task={t} onTaskClick={onTaskClick} />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        <DragOverlay>
          {activeTask ? <TaskDragOverlay task={activeTask} /> : null}
        </DragOverlay>

      <style>{`
        .premium-calendar-wrapper {
          background: #f8fafc;
          border-radius: 20px;
          padding: 24px;
          height: 100%;
          border: 1px solid #f1f5f9;
        }
        
        .calendar-main-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
        }

        @media (min-width: 1024px) {
          .calendar-main-layout {
            flex-direction: row;
          }
        }

        /* PANEL KIRI: KALENDER GRID */
        .calendar-grid-panel {
          flex: 1;
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }

        .calendar-navigation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          background: #f8fafc;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid #edf2f7;
        }

        .month-year-label {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1e293b;
        }

        .nav-arrow-btn {
          padding: 6px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-arrow-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          transform: scale(1.05);
        }

        .calendar-grid-container {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          flex: 1;
        }

        .calendar-day-label {
          text-align: center;
          font-weight: 700;
          color: #94a3b8;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding-bottom: 8px;
          border-b: 1px solid #f1f5f9;
        }

        .calendar-cell {
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          padding: 10px 8px;
          min-height: 75px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: white;
          cursor: pointer;
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .calendar-cell:hover:not(.empty) {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          background: #f8fafc;
        }

        .calendar-cell.empty {
          background: #f8fafc/30;
          border: none;
          cursor: default;
          pointer-events: none;
        }

        .calendar-cell.today {
          border-color: #bfdbfe;
          background: #eff6ff/70;
        }
        
        .calendar-cell.today .calendar-date-number {
          color: #2563eb;
          background: #dbeafe;
          border-radius: 6px;
          padding: 2px 6px;
        }

        .calendar-cell.selected {
          border-color: #B8842A;
          background: #fdfaf4;
          box-shadow: 0 0 0 2px rgba(184, 132, 42, 0.15);
        }

        .calendar-date-number {
          font-weight: 700;
          font-size: 0.85rem;
          color: #475569;
          align-self: flex-end;
          transition: all 0.2s;
        }

        .calendar-dot-indicators {
          display: flex;
          gap: 4px;
          align-self: flex-start;
          margin-top: auto;
          flex-wrap: wrap;
        }

        .dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .dot-indicator.class { background: #3b82f6; }
        .dot-indicator.pending-task { background: #f59e0b; }
        .dot-indicator.done-task { background: #10b981; }


        /* PANEL KANAN: SIDEBAR DETAIL AGENDA */
        .calendar-detail-sidebar {
          width: 100%;
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        @media (min-width: 1024px) {
          .calendar-detail-sidebar {
            width: 320px;
          }
        }

        .sidebar-date-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .sidebar-date-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1e293b;
        }

        .today-badge {
          background: #fef3c7;
          color: #d97706;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .sidebar-actions {
          margin-bottom: 20px;
        }

        .quick-add-task-btn {
          width: 100%;
          background: #4B3A2F;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .quick-add-task-btn:hover {
          background: #3d3025;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(75, 58, 47, 0.2);
        }

        .agenda-scroll-container {
          flex: 1;
          overflow-y: auto;
          max-height: 380px;
          padding-right: 4px;
        }

        .agenda-section-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .agenda-empty-state {
          font-size: 0.75rem;
          color: #94a3b8;
          background: #f8fafc;
          padding: 16px;
          border-radius: 10px;
          border: 1px dashed #e2e8f0;
          text-align: center;
        }

        .agenda-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .agenda-class-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #B8842A;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .class-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .class-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
        }

        .class-room {
          background: #eff6ff;
          color: #2563eb;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .class-time {
          font-size: 0.7rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .agenda-task-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all 0.2s;
        }

        .agenda-task-card:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          transform: translateX(2px);
        }

        .task-card-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .task-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.25;
        }

        .agenda-task-card.done .task-title {
          color: #94a3b8;
          text-decoration: line-through;
        }

        .task-status-badge {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .task-status-badge.todo {
          background: #f1f5f9;
          color: #475569;
        }

        .task-status-badge.progress {
          background: #fffbeb;
          color: #d97706;
        }

        .task-status-badge.done {
          background: #ecfdf5;
          color: #059669;
        }

        .task-course-tag {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 600;
        }
      `}</style>
    </div>
    </DndContext>
  )
}
