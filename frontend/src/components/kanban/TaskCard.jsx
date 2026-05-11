/**
 * TaskCard – FR-07 Kanban Board
 * Drag & drop menggunakan @dnd-kit/sortable
 */
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { Pencil, Trash2, Calendar, GripVertical } from 'lucide-react'
import { PRIORITAS_STYLE, deadlineBadge, formatDate } from '../../utils/taskHelpers'

export default function TaskCard({ task, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  // ── dnd-kit sortable hook ──────────────────────────────────────────────
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex:  isDragging ? 999 : undefined,
  }

  const p     = PRIORITAS_STYLE[task.prioritas]
  const badge = deadlineBadge(task.deadline, task.status === 'done')

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-xl border border-primary-100 p-3.5 shadow-sm
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group
        ${task.is_overdue ? 'border-l-4 border-l-red-400' : ''}
        ${task.status === 'done' ? 'opacity-70' : ''}
        ${isDragging ? 'shadow-2xl ring-2 ring-primary-400' : ''}
      `}
    >
      {/* Top: grip handle + prioritas + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Grip handle — hanya area ini yang bisa di-drag */}
          <button
            className="cursor-grab active:cursor-grabbing text-primary-200 hover:text-primary-500 transition-colors touch-none shrink-0 mt-0.5"
            {...attributes}
            {...listeners}
            title="Drag untuk memindahkan"
          >
            <GripVertical size={15} />
          </button>

          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
            {p.label}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-lg text-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1 rounded-lg transition-colors
              ${confirmDelete
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-primary-400 hover:text-red-500 hover:bg-red-50'
              }`}
            title={confirmDelete ? 'Klik lagi untuk konfirmasi hapus' : 'Hapus task'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Judul */}
      <p className={`text-sm font-semibold text-primary-800 leading-snug mb-2
        ${task.status === 'done' ? 'line-through text-primary-400' : ''}`}>
        {task.judul}
      </p>

      {/* Deskripsi */}
      {task.deskripsi && (
        <p className="text-xs text-primary-400 mb-2 line-clamp-2">{task.deskripsi}</p>
      )}

      {/* Mata kuliah chip */}
      {task.mata_kuliah_detail && (
        <div className="mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
            📚 {task.mata_kuliah_detail.nama}
          </span>
        </div>
      )}

      {/* Footer: deadline */}
      <div className="flex items-center gap-1.5 mt-1">
        <Calendar size={11} className="text-primary-300" />
        <span className="text-xs text-primary-400">{formatDate(task.deadline)}</span>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
          {badge.text}
        </span>
      </div>
    </div>
  )
}
