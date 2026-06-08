/**
 * KanbanColumn – FR-07
 * Drop container menggunakan @dnd-kit/core (useDroppable)
 * Sortable list menggunakan @dnd-kit/sortable (SortableContext)
 */
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import { STATUS_META } from '../../utils/taskHelpers'

export default function KanbanColumn({
  colKey,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isOver,         // diterima dari KanbanBoard saat card di-drag ke kolom ini
}) {
  const meta = STATUS_META[colKey]

  // ── useDroppable: kolom sebagai drop target ─────────────────────────────
  const { setNodeRef } = useDroppable({ id: colKey })

  const taskIds = tasks.map(t => t.id)

  return (
    <div className="flex flex-col min-w-[300px] flex-1">

      {/* Column header */}
      <div className={`
        flex items-center justify-between px-4 py-3 rounded-t-xl
        border-t-4 bg-white border border-b-0
        ${colKey === 'todo'        ? 'border-t-slate-400  border-slate-200' : ''}
        ${colKey === 'in_progress' ? 'border-t-blue-500   border-blue-200'  : ''}
        ${colKey === 'done'        ? 'border-t-green-500  border-green-200' : ''}
      `}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
            {tasks.length}
          </span>
        </div>
        {colKey === 'todo' && (
          <button
            onClick={onAddTask}
            className="p-1 rounded-lg text-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
            title="Tambah task baru"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Drop zone — ref dari useDroppable dipasang di sini */}
      <div
        ref={setNodeRef}
        className={`
          flex flex-col gap-3 p-3 rounded-b-xl flex-1 min-h-[200px]
          border border-t-0 transition-colors duration-150
          ${colKey === 'todo'        ? 'border-slate-200  bg-slate-50'     : ''}
          ${colKey === 'in_progress' ? 'border-blue-200   bg-blue-50/50'   : ''}
          ${colKey === 'done'        ? 'border-green-200  bg-green-50/40'  : ''}
          ${isOver ? 'ring-2 ring-primary-400 ring-inset bg-primary-50/30' : ''}
        `}
      >
        {/* SortableContext: bungkus semua TaskCard dalam kolom */}
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-primary-300 text-xs text-center gap-1 select-none">
            <span>{isOver ? 'Lepaskan di sini' : 'Belum ada task'}</span>
          </div>
        )}

        {/* Drop indicator saat drag masuk kolom yang ada isinya */}
        {isOver && tasks.length > 0 && (
          <div className="h-12 rounded-xl border-2 border-dashed border-primary-400 bg-primary-50 animate-pulse" />
        )}
      </div>
    </div>
  )
}
