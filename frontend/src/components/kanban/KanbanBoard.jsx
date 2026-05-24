/**
 * KanbanBoard – FR-07: Kanban Board Visual
 * Drag & drop antar kolom menggunakan @dnd-kit/core + @dnd-kit/sortable
 *
 * Flow:
 *  1. DndContext membungkus seluruh board
 *  2. Setiap kolom adalah useDroppable (kolom sebagai drop zone)
 *  3. Setiap TaskCard adalah useSortable (bisa di-drag & di-reorder)
 *  4. onDragEnd menentukan task berpindah ke kolom mana
 */
import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { Plus, RefreshCw, LayoutDashboard, Inbox, Filter } from 'lucide-react'

import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import LoadingState from '../common/LoadingState'
import TaskModal from '../tasks/TaskModal'
import { useTasks } from '../../hooks/useTasks'

const COLUMNS = ['todo', 'in_progress', 'done']

export default function KanbanBoard() {
  const {
    board, setBoard,
    mataKuliah, loading,
    fetchBoard,
    createTask, updateTask, deleteTask, moveTask,
  } = useTasks()

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // activeTask = task yang sedang di-drag (untuk DragOverlay)
  const [activeTask,  setActiveTask]  = useState(null)
  // overColumn = kolom yang sedang di-hover saat drag
  const [overColumn,  setOverColumn]  = useState(null)

  // ── Sorting ─────────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState('manual') // 'manual' | 'deadline' | 'prioritas'

  const sortedBoard = useMemo(() => {
    if (sortBy === 'manual') return board

    const sortTasks = (tasks) => {
      return [...tasks].sort((a, b) => {
        if (sortBy === 'deadline') {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline) - new Date(b.deadline)
        } else if (sortBy === 'prioritas') {
          const p = { tinggi: 3, sedang: 2, rendah: 1 }
          const valA = p[a.prioritas] || 0
          const valB = p[b.prioritas] || 0
          return valB - valA // descending
        }
        return 0
      })
    }
    
    return {
      todo: sortTasks(board.todo),
      in_progress: sortTasks(board.in_progress),
      done: sortTasks(board.done)
    }
  }, [board, sortBy])

  // ── dnd-kit sensors ─────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Minimal gerak 8px sebelum drag mulai (mencegah klik tak sengaja)
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ── Helper: cari kolom berdasarkan taskId ────────────────────────────────
  const findColumn = useCallback((taskId) =>
    COLUMNS.find(col => board[col].some(t => t.id === taskId)),
  [board])

  // ── onDragStart: simpan task yang aktif ─────────────────────────────────
  const handleDragStart = ({ active }) => {
    const col   = findColumn(active.id)
    const task  = col ? board[col].find(t => t.id === active.id) : null
    setActiveTask(task ?? null)
  }

  // ── onDragOver: update overColumn untuk highlight ────────────────────────
  const handleDragOver = ({ over }) => {
    if (!over) { setOverColumn(null); return }
    // over.id bisa berupa colKey (kolom) atau taskId (sortable item)
    const col = COLUMNS.includes(over.id)
      ? over.id
      : findColumn(over.id)
    setOverColumn(col ?? null)
  }

  // ── onDragEnd: commit perubahan ──────────────────────────────────────────
  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    setOverColumn(null)

    if (!over || !active) return

    const fromCol = findColumn(active.id)
    if (!fromCol) return

    // Tentukan kolom tujuan
    const toCol = COLUMNS.includes(over.id)
      ? over.id
      : findColumn(over.id) ?? fromCol

    if (fromCol === toCol) {
      // Jika mode sorting sedang aktif, abaikan manual reorder
      if (sortBy !== 'manual') return

      // ── Reorder dalam kolom yang sama ──
      const oldIndex = board[fromCol].findIndex(t => t.id === active.id)
      const newIndex = board[toCol].findIndex(t => t.id === over.id)
      if (oldIndex === newIndex) return

      // Optimistic update
      setBoard(prev => ({
        ...prev,
        [fromCol]: arrayMove(prev[fromCol], oldIndex, newIndex),
      }))
      moveTask(active.id, fromCol, toCol, newIndex)
    } else {
      // ── Pindah antar kolom ──
      const task     = board[fromCol].find(t => t.id === active.id)
      const toIndex  = board[toCol].findIndex(t => t.id === over.id)
      const insertAt = toIndex >= 0 ? toIndex : board[toCol].length

      // Optimistic update
      setBoard(prev => {
        const newFrom = prev[fromCol].filter(t => t.id !== active.id)
        const newTo   = [...prev[toCol]]
        newTo.splice(insertAt, 0, { ...task, status: toCol })
        return { ...prev, [fromCol]: newFrom, [toCol]: newTo }
      })
      moveTask(active.id, fromCol, toCol, insertAt)
    }
  }

  // ── Modal handlers ───────────────────────────────────────────────────────
  const openCreate  = () => { setEditingTask(null); setModalOpen(true) }
  const openEdit    = (task) => { setEditingTask(task); setModalOpen(true) }
  const closeModal  = () => { setModalOpen(false); setEditingTask(null) }
  const handleSave  = async (data) => {
    if (editingTask) await updateTask(editingTask.id, data)
    else             await createTask(data)
  }

  // ── Progress stats ───────────────────────────────────────────────────────
  const total    = COLUMNS.reduce((s, c) => s + board[c].length, 0)
  const done     = board.done.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  if (loading) {
    return <LoadingState message="Memuat Kanban Board..." />
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top Bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-primary-800">Kanban Board</h1>
            <p className="text-xs text-primary-400">{total} task · {progress}% selesai</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select 
              className="text-xs font-semibold text-slate-600 outline-none bg-transparent cursor-pointer"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="manual">Manual (Drag)</option>
              <option value="deadline">Deadline</option>
              <option value="prioritas">Prioritas</option>
            </select>
          </div>
          <button
            onClick={fetchBoard}
            className="p-2 rounded-xl text-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors bg-white border border-slate-200 shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm shadow-sm">
            <Plus size={16} />
            Tambah Task
          </button>
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────────────── */}
      {total > 0 && (
        <div className="bg-white border border-primary-100 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-primary-500 mb-2">
            <span className="font-semibold">Progress Keseluruhan</span>
            <span className="font-bold text-primary-700">{progress}%</span>
          </div>
          <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-primary-400 mt-2">
            <span>📋 {board.todo.length} To Do</span>
            <span>⚙️ {board.in_progress.length} In Progress</span>
            <span>✅ {board.done.length} Done</span>
          </div>
        </div>
      )}

      {/* ── Kanban Columns (dibungkus DndContext) ─────────────────────── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {total === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-2xl py-20 px-4 text-center mt-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Inbox size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Belum Ada Task</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Kanban board Anda masih kosong. Buat task pertama Anda untuk mulai mengatur jadwal dengan lebih baik!
            </p>
            <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-[#4B3A2F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3D2F26] shadow-sm">
              <Plus size={16} /> Buat Task Pertama
            </button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col}
                colKey={col}
                tasks={sortedBoard[col]}
                onAddTask={openCreate}
                onEditTask={openEdit}
                onDeleteTask={deleteTask}
                isOver={overColumn === col}
              />
            ))}
          </div>
        )}

        {/*
          DragOverlay: tampilan "ghost" card yang mengikuti kursor saat drag.
          Dirender di luar kolom agar tidak terpotong overflow.
        */}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeTask ? (
            <div className="rotate-2 scale-105 shadow-2xl">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Task Modal (FR-04 / FR-05) ────────────────────────────────── */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          mataKuliah={mataKuliah}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
