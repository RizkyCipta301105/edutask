import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarView({ tasks = [], mataKuliah = [], onTaskClick, roleView = 'umum' }) {
  const [currentDate, setCurrentDate] = useState(new Date())

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

  // Map tasks to their deadline dates (YYYY-MM-DD string)
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      if (t.deadline) {
        // deadline is usually "YYYY-MM-DD"
        if (!map[t.deadline]) map[t.deadline] = []
        map[t.deadline].push(t)
      }
    })
    return map
  }, [tasks])

  const renderCells = () => {
    const cells = []
    
    // Empty cells for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>)
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      // Format as YYYY-MM-DD
      const yyyy = year
      const mm = String(month + 1).padStart(2, '0')
      const dd = String(i).padStart(2, '0')
      const dateString = `${yyyy}-${mm}-${dd}`

      const dayTasks = tasksByDate[dateString] || []
      const isToday = new Date().toDateString() === new Date(year, month, i).toDateString()
      const currentDayOfWeek = new Date(year, month, i).getDay()
      
      const dayClasses = (mataKuliah || []).filter(mk => mk.hari !== null && mk.hari !== undefined && Number(mk.hari) === currentDayOfWeek)

      cells.push(
        <div key={i} className={`calendar-cell ${isToday ? 'today' : ''}`}>
          <div className="calendar-date">{i}</div>
          <div className="calendar-events">
            {dayClasses.map(mk => (
              <div 
                key={`mk-${mk.id}-${dateString}`} 
                className="calendar-class-event"
                style={{ borderLeft: `3px solid ${mk.warna || '#8B6914'}` }}
                title={`${mk.nama} - ${mk.ruangan || 'Tanpa Ruangan'}`}
              >
                <div style={{ fontWeight: 600, color: '#111827' }}>{mk.nama}</div>
                {mk.jam_mulai && mk.jam_selesai && (
                  <div style={{ color: '#6b7280' }}>{mk.jam_mulai.substring(0,5)} - {mk.jam_selesai.substring(0,5)}</div>
                )}
                {mk.ruangan && <div style={{ color: '#3b82f6' }}>{mk.ruangan}</div>}
              </div>
            ))}
            {dayTasks.map(t => (
              <div 
                key={t.id} 
                className={`calendar-event status-${t.status.replace('_', '-')}`}
                title={t.judul}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onTaskClick) onTaskClick(t.id)
                }}
                style={{ cursor: 'pointer' }}
              >
                {t.judul}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return cells
  }

  const calendarTitle = roleView === 'dosen' 
    ? 'Kalender Akademik & Mengajar' 
    : (roleView === 'mahasiswa' ? 'Jadwal Kuliah & Deadline' : 'Kalender Pribadi & Jadwal')

  return (
    <div className="calendar-container">
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>{calendarTitle}</h1>
      </div>
      <div className="calendar-header-bar">
        <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={20}/></button>
        <h2>{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="btn-icon"><ChevronRight size={20}/></button>
      </div>

      <div className="calendar-grid">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}
        {renderCells()}
      </div>

      <style>{`
        .calendar-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .calendar-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .calendar-header-bar h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          flex: 1;
        }
        .calendar-day-name {
          text-align: center;
          font-weight: 600;
          color: #6b7280;
          font-size: 0.85rem;
          padding-bottom: 8px;
        }
        .calendar-cell {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          background: #f9fafb;
        }
        .calendar-cell.empty {
          background: transparent;
          border: none;
        }
        .calendar-cell.today {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .calendar-date {
          font-weight: 600;
          font-size: 0.9rem;
          color: #374151;
          margin-bottom: 8px;
          align-self: flex-end;
        }
        .calendar-events {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          flex: 1;
        }
        .calendar-event {
          font-size: 0.75rem;
          padding: 4px 6px;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: white;
        }
        .calendar-class-event {
          font-size: 0.7rem;
          padding: 6px 8px;
          border-radius: 4px;
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .status-todo { background: #6b7280; }
        .status-in-progress { background: #f59e0b; }
        .status-done { background: #10b981; }
      `}</style>
    </div>
  )
}
