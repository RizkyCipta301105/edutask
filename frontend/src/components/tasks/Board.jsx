import { useState, useMemo } from 'react'
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, MoreHorizontal, ChevronDown, Filter, ArrowUpDown, GripVertical, Menu, Inbox } from 'lucide-react'
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
    <div ref={setNodeRef} style={style} className={`kanban-card ${isCompact ? 'compact' : ''}`} {...attributes}>
      <div className="kanban-card-drag-handle" {...listeners}>
        <GripVertical size={16} color="#9ca3af" />
      </div>
      <div className="kanban-card-body" onClick={() => onTaskClick(card.id)}>
        <div className="kanban-card-title" style={{ fontSize: isCompact ? '0.85rem' : '0.95rem' }}>
          {card.judul}
        </div>
        <div className="kanban-card-labels">
          <span className={`label glow-priority-${card.prioritas || 'sedang'}`}>{p.label}</span>
          {!isCompact && card.mata_kuliah_detail?.nama && (
            <span className="label">📚 {card.mata_kuliah_detail.nama}</span>
          )}
        </div>
        {!isCompact && card.deadline && (
          <div className="kanban-card-meta">
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              📅 {new Date(card.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function CardOverlay({ card }) {
  return (
    <div className="kanban-card kanban-card-overlay">
      <div className="kanban-card-title">{card.judul}</div>
      <div className="kanban-card-labels">
        {PRIORITAS_COLORS[card.prioritas] && (
          <span className={`label glow-priority-${card.prioritas || 'sedang'}`}>
            {PRIORITAS_COLORS[card.prioritas].label}
          </span>
        )}
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
    <div className="kanban-col" ref={setNodeRef}>
      <div className="kanban-col-header">
        <span>{title} <span className="kanban-col-count">{cards.length}</span></span>
        <div className="kanban-col-actions">
          <Plus size={18} style={{ cursor: 'pointer' }} onClick={onAddTask} />
          <MoreHorizontal size={18} style={{ cursor: 'pointer' }} />
        </div>
      </div>
      <div className="kanban-cards-container">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <SortableCard key={card.id} card={card} onTaskClick={onTaskClick} viewMode={viewMode} />
          ))}
        </SortableContext>
        {cards.length === 0 && !isAdding && (
          <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
            Drop tasks di sini
          </div>
        )}
        {isAdding && (
          <form onSubmit={handleSubmit} className="kanban-quick-add-form">
            <input
              type="text"
              className="kanban-quick-add-input"
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
      <div className="kanban-add-card" onClick={() => setIsAdding(true)}>
        <Plus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Tambah task cepat
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', backgroundColor: '#fff', border: '1px dashed #e5e7eb', borderRadius: '16px', margin: '20px' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#f9fafb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Inbox size={32} color="#d1d5db" />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>Belum Ada Task</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', maxWidth: '300px', textAlign: 'center', marginBottom: '24px' }}>
              Kanban board Anda masih kosong. Buat task pertama Anda untuk mulai mengatur jadwal dengan lebih baik!
            </p>
            <button 
              onClick={onAddTask}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#4b3a2f', color: '#fff', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', border: 'none' }}
            >
              <Plus size={16} /> Buat Task Pertama
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
