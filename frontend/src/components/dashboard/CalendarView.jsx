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
                  {mk.nama}
                </div>
              ))}
              {dayTasks.slice(0, 3).map(t => (
                <div key={t.id} className="calendar-popover-item" style={{ borderLeft: '3px solid #f59e0b', background: '#fffbeb', color: '#b45309' }}>
                  {t.judul}
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
                <h1 className="text-2xl font-black text-black uppercase flex items-center gap-2">
                  <Calendar className="text-black stroke-2" size={24} />
                  {calendarTitle}
                </h1>
                 <p className="font-bold text-black border-2 border-black bg-white inline-block px-3 py-1 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
          background: #fff;
          border: 4px solid #000;
          box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
          padding: 24px;
          height: 100%;
          overflow: hidden;
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
          background: #fde047;
          border: 4px solid #000;
          padding: 24px;
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .calendar-navigation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          background: #fff;
          padding: 8px 16px;
          border: 4px solid #000;
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
        }

        .month-year-label {
          font-size: 1.25rem;
          font-weight: 900;
          color: #000;
          text-transform: uppercase;
        }

        .nav-arrow-btn {
          padding: 6px;
          border: 2px solid #000;
          background: #fff;
          color: #000;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
        }

        .nav-arrow-btn:hover {
          background: #f472b6;
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px 0px rgba(0,0,0,1);
        }

        .calendar-grid-container {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 8px;
          flex: 1;
          width: 100%;
        }

        @media (max-width: 768px) {
          .calendar-grid-container {
            gap: 4px;
          }
          .calendar-grid-panel {
            padding: 12px;
          }
        }

        .calendar-day-label {
          text-align: center;
          font-weight: 900;
          color: #000;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding-bottom: 8px;
          border-b: 4px solid #000;
        }

        .calendar-cell {
          border: 2px solid #000;
          padding: 8px 6px;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #fff;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s;
          box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
        }

        @media (max-width: 480px) {
          .calendar-cell {
            padding: 4px;
            min-height: 50px;
            border: 1px solid #000;
            box-shadow: 1px 1px 0px 0px rgba(0,0,0,1);
          }
          .calendar-date-number {
            font-size: 0.8rem;
          }
          .calendar-day-label {
            font-size: 0.7rem;
            padding-bottom: 4px;
          }
        }

        .calendar-cell:hover:not(.empty) {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
          background: #fcd34d;
        }

        .calendar-cell.empty {
          background: rgba(255,255,255,0.5);
          border: 2px dashed #000;
          cursor: default;
          pointer-events: none;
          box-shadow: none;
        }

        .calendar-cell.today {
          background: #bfdbfe;
          border: 4px solid #000;
        }
        
        .calendar-cell.today .calendar-date-number {
          color: #000;
          background: #fff;
          border: 2px solid #000;
          padding: 2px 6px;
          font-weight: 900;
        }

        .calendar-cell.selected {
          border: 4px solid #000;
          background: #f472b6;
        }

        .calendar-date-number {
          font-weight: 900;
          font-size: 1rem;
          color: #000;
          align-self: flex-end;
        }

        .calendar-dot-indicators {
          display: flex;
          gap: 4px;
          align-self: flex-start;
          margin-top: auto;
          flex-wrap: wrap;
        }

        .dot-indicator {
          width: 8px;
          height: 8px;
          border: 2px solid #000;
        }

        .dot-indicator.class { background: #3b82f6; }
        .dot-indicator.pending-task { background: #f59e0b; }
        .dot-indicator.done-task { background: #10b981; }

        /* PANEL KANAN: SIDEBAR DETAIL AGENDA */
        .calendar-detail-sidebar {
          width: 100%;
          background: #bfdbfe;
          border: 4px solid #000;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
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
          background: #fff;
          padding: 8px;
          border: 2px solid #000;
          box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
        }

        .sidebar-date-title {
          font-size: 1rem;
          font-weight: 900;
          color: #000;
          text-transform: uppercase;
        }

        .today-badge {
          background: #fde047;
          color: #000;
          font-size: 0.75rem;
          font-weight: 900;
          padding: 2px 8px;
          border: 2px solid #000;
          text-transform: uppercase;
        }

        .sidebar-actions {
          margin-bottom: 20px;
        }

        .quick-add-task-btn {
          width: 100%;
          background: #f472b6;
          color: #000;
          border: 4px solid #000;
          padding: 10px;
          font-weight: 900;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: transform 0.2s;
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
          text-transform: uppercase;
        }

        .quick-add-task-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);
        }

        .agenda-scroll-container {
          flex: 1;
          overflow-y: auto;
          max-height: 380px;
          padding-right: 4px;
        }

        .agenda-section-title {
          font-size: 0.85rem;
          font-weight: 900;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          padding: 4px 8px;
          border: 2px solid #000;
          box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
          display: inline-flex;
        }

        .agenda-empty-state {
          font-size: 0.85rem;
          color: #000;
          background: #fff;
          padding: 16px;
          border: 4px dashed #000;
          text-align: center;
          font-weight: 900;
          text-transform: uppercase;
        }

        .agenda-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .agenda-class-card {
          background: #fff;
          border: 4px solid #000;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
          transition: transform 0.2s;
        }
        
        .agenda-class-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);
        }

        .class-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .class-name {
          font-size: 0.9rem;
          font-weight: 900;
          color: #000;
          text-transform: uppercase;
        }

        .class-room {
          background: #fde047;
          color: #000;
          font-size: 0.75rem;
          font-weight: 900;
          padding: 2px 6px;
          border: 2px solid #000;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .class-time {
          font-size: 0.8rem;
          color: #000;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 900;
        }

        .agenda-task-card {
          background: #fff;
          border: 4px solid #000;
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform 0.2s;
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
        }

        .agenda-task-card:hover {
          background: #fcd34d;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);
        }

        .task-card-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .task-title {
          font-size: 0.9rem;
          font-weight: 900;
          color: #000;
          line-height: 1.25;
          text-transform: uppercase;
        }

        .agenda-task-card.done .task-title {
          color: #000;
          text-decoration: line-through;
          text-decoration-thickness: 3px;
        }

        .task-status-badge {
          font-size: 0.7rem;
          font-weight: 900;
          padding: 2px 6px;
          border: 2px solid #000;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .task-status-badge.todo {
          background: #fff;
          color: #000;
        }

        .task-status-badge.progress {
          background: #fde047;
          color: #000;
        }

        .task-status-badge.done {
          background: #4ade80;
          color: #000;
        }

        .task-course-tag {
          font-size: 0.75rem;
          color: #000;
          font-weight: 900;
          text-transform: uppercase;
          border-top: 2px solid #000;
          padding-top: 4px;
          margin-top: 2px;
        }
      `}</style>
    </div>
    </DndContext>
  )
}
