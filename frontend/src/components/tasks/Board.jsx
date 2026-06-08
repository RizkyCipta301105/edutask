import { useState, useMemo } from 'react'
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, MoreHorizontal, ChevronDown, Filter, ArrowUpDown, GripVertical, Menu, Inbox, MessageSquare, BookOpen, Building2, User, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import taskService from '../../services/taskService'
import { getApiErrorMessage } from '../../utils/apiErrors'

const STATUS_MAP = {
  todo:        'To Do',
  in_progress: 'In Progress',
  done:        'Done',
}

const PRIORITAS_COLORS = {
  tinggi: { bg: '#fef2f2', color: '#dc2626', label: 'Tinggi' },
  sedang: { bg: '#fffbeb', color: '#d97706', label: 'Sedang' },
  rendah: { bg: '#f0fdf4', color: '#16a34a', label: 'Rendah' },
}

const COLUMNS = ['todo', 'in_progress', 'done']

function SortableCard({ card, onTaskClick, viewMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(card.id),
  })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  
  const isCompact = viewMode === 'compact'
  const p = PRIORITAS_COLORS[card.prioritas] || PRIORITAS_COLORS.sedang

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 relative transition-transform hover:-translate-y-1 hover:-translate-x-1 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
      onClick={(e) => {
        if (!e.defaultPrevented && !isDragging) {
          onTaskClick(card.id)
        }
      }}
    >
      <div className={`font-black uppercase mb-3 text-black ${isCompact ? 'text-sm mb-2' : 'text-base'}`}>
        {card.judul}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
          <MessageSquare size={14} className="stroke-2" /> {card.comments_count || 0}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`text-xs font-bold px-2 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]`} style={{ backgroundColor: p.bg, color: 'black' }}>{p.label}</span>
          {!isCompact && card.mata_kuliah_detail?.nama && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 border-2 border-black dark:border-white bg-pink-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"><BookOpen size={12} className="stroke-2" /> {card.mata_kuliah_detail.nama}</span>
          )}
          {!isCompact && card.workspace_detail?.nama_ruang && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 border-2 border-black dark:border-white bg-blue-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"><Building2 size={12} className="stroke-2" /> {card.workspace_detail.nama_ruang}</span>
          )}
          {!isCompact && !card.mata_kuliah_detail && !card.workspace_detail && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 border-2 border-black dark:border-white bg-gray-200 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"><User size={12} className="stroke-2" /> Pribadi</span>
          )}
        </div>
        {!isCompact && card.deadline && (
          <div className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300 mt-3 border-t-2 border-black dark:border-gray-500 pt-2">
            <CalendarDays size={12} className="stroke-2" /> {new Date(card.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  )
}

function CardOverlay({ card }) {
  const p = PRIORITAS_COLORS[card.prioritas] || PRIORITAS_COLORS.sedang
  return (
    <div className="border-4 border-black bg-white dark:bg-[#222] dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-4 relative rotate-2 opacity-90">
      <div className="font-black uppercase mb-3 text-black dark:text-white">{card.judul}</div>
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs font-bold px-2 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]`} style={{ backgroundColor: p.bg, color: 'black' }}>
          {p.label}
        </span>
      </div>
    </div>
  )
}

function DroppableColumn({ columnId, title, cards, onTaskClick, onAddTask, onQuickAdd, viewMode }) {
  const { setNodeRef } = useDroppable({ id: columnId, data: { type: 'column' } })
  const cardIds = cards.map(c => String(c.id))

  const [quickTitle, setQuickTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const t = quickTitle.trim()
    if (!t) return
    setQuickTitle('')
    setIsAdding(false)
    if (onQuickAdd) {
      try {
        await onQuickAdd(t, columnId)
      } catch (err) {
        toast.error('Gagal menambahkan task cepat.')
      }
    }
  }

  return (
    <div className="w-[280px] sm:w-[300px] md:w-[320px] min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex flex-col max-h-[85vh] bg-blue-300 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 scroll-snap-align-start" ref={setNodeRef}>
      <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2 bg-white px-3 py-2 border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 hover:rotate-0 transition-transform">
        <span className="font-black uppercase text-lg text-black">{title} <span className="text-sm border-2 border-black bg-yellow-300 px-2 py-0.5 ml-2">{cards.length}</span></span>
        <div className="flex gap-2 text-black">
          <Plus size={24} className="stroke-2 cursor-pointer hover:scale-110" onClick={onAddTask} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-[60px] p-1">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <SortableCard key={card.id} card={card} onTaskClick={onTaskClick} viewMode={viewMode} />
          ))}
        </SortableContext>
        {cards.length === 0 && !isAdding && (
          <div className="p-6 text-center font-bold text-black border-4 border-dashed border-black bg-white/50 m-2">
            DROP TASKS DI SINI
          </div>
        )}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-3">
            <input
              type="text"
              className="w-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 font-bold text-black outline-none bg-yellow-100 placeholder-black"
              placeholder="Tulis judul task..."
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  if (!quickTitle.trim()) {
                    setIsAdding(false)
                  }
                }, 200)
              }}
              autoFocus
            />
          </form>
        )}
      </div>
      <div className="border-4 border-black bg-green-400 p-3 font-black text-black uppercase text-center mt-3 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" onClick={() => setIsAdding(true)}>
        <Plus size={20} className="inline-block mr-2 stroke-2" /> TAMBAH TASK CEPAT
      </div>
    </div>
  )
}

export default function Board({ tasks = [], onTaskClick, onAddTask, onMoveTask, onQuickAdd }) {
  const [activeId, setActiveId] = useState(null)
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [viewMode, setViewMode] = useState('default')

  const prioritasOrder = { tinggi: 0, sedang: 1, rendah: 2 }

  const processedBoard = useMemo(() => {
    const result = {
      todo: [],
      in_progress: [],
      done: [],
    }

    ;(tasks || []).forEach(task => {
      let status = task.status
      if (status === 'in-progress') status = 'in_progress'
      if (status === 'completed') status = 'done'

      if (result[status]) {
        result[status].push(task)
      } else {
        result.todo.push(task)
      }
    })

    if (filterPriority !== 'all') {
      COLUMNS.forEach(col => {
        result[col] = result[col].filter(t => t.prioritas === filterPriority)
      })
    }

    COLUMNS.forEach(col => {
      if (sortBy === 'title') {
        result[col].sort((a, b) => (a.judul || '').localeCompare(b.judul || ''))
      } else if (sortBy === 'priority') {
        result[col].sort((a, b) => (prioritasOrder[a.prioritas] ?? 3) - (prioritasOrder[b.prioritas] ?? 3))
      }
    })

    return result
  }, [tasks, filterPriority, sortBy])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function findColumnForCard(cardId) {
    const idStr = String(cardId)
    for (const col of COLUMNS) {
      if ((processedBoard[col] || []).some(t => String(t.id) === idStr)) return col
    }
    return null
  }

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeCol = findColumnForCard(active.id)
    const overCol = COLUMNS.includes(over.id) ? over.id : findColumnForCard(over.id)

    if (activeCol && overCol && activeCol !== overCol) {
      const taskId = active.id
      if (onMoveTask) {
        onMoveTask(taskId, overCol)
      }
    }
  }

  const activeCard = activeId
    ? (tasks || []).find(t => String(t.id) === String(activeId))
    : null

  return (
    <div className="board-wrapper">
      <div className="page-header">
        <div className="page-title">Board <ChevronDown size={20} color="#111827" /></div>
        <div className="page-controls">
          <div
            className={`control-item ${filterPriority !== 'all' ? 'active-filter' : ''}`}
            onClick={() => setFilterPriority(prev => prev === 'tinggi' ? 'all' : 'tinggi')}
          >
            <Filter size={16} />
            <span className="control-label">Filter Prioritas {filterPriority !== 'all' ? `(${filterPriority})` : ''}</span>
          </div>

          <div className="control-item" onClick={() => setSortBy(prev => prev === 'title' ? 'priority' : prev === 'priority' ? 'default' : 'title')}>
            <ArrowUpDown size={16} />
            <span className="control-label">Sort {sortBy !== 'default' ? `(${sortBy})` : ''}</span>
          </div>

          <div className="control-item" onClick={() => setViewMode(prev => prev === 'default' ? 'compact' : 'default')}>
            <Menu size={16} />
            <span className="control-label">View ({viewMode})</span>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {(tasks || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] bg-yellow-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] m-6 p-8">
            <div className="w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 -rotate-6">
              <Inbox size={32} className="text-black stroke-2" />
            </div>
            <h3 className="text-2xl font-black uppercase text-black mb-2">Belum Ada Task</h3>
            <p className="text-sm font-bold text-black text-center mb-6 max-w-sm border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Kanban board Anda masih kosong. Buat task pertama Anda untuk mulai mengatur jadwal dengan lebih baik!
            </p>
            <button 
              onClick={onAddTask}
              className="flex items-center gap-2 border-4 border-black bg-pink-400 px-6 py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            >
              <Plus size={20} className="stroke-2" /> Buat Task Pertama
            </button>
          </div>
        ) : (
          <div className="kanban-board">
            {COLUMNS.map(col => (
              <DroppableColumn
                key={col}
                columnId={col}
                title={STATUS_MAP[col]}
                cards={processedBoard[col] || []}
                onTaskClick={onTaskClick}
                onAddTask={onAddTask}
                onQuickAdd={onQuickAdd}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
        <DragOverlay>
          {activeCard ? <CardOverlay card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
