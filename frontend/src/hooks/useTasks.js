/**
 * Custom hook untuk manajemen Task + Kanban state
 * Dipakai di KanbanBoard dan TaskModal
 * setBoard di-expose agar KanbanBoard bisa optimistic update saat drag
 */
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import taskService from '../services/taskService'

// Global cache untuk SWR pattern (Stale-While-Revalidate)
let globalBoardCache = null;
let globalMataKuliahCache = null;

export function useTasks() {
  const [board, setBoard]           = useState(globalBoardCache || { todo: [], in_progress: [], done: [] })
  const [mataKuliah, setMataKuliah] = useState(globalMataKuliahCache || [])
  const [loading, setLoading]       = useState(!globalBoardCache) // Jangan loading jika cache ada

  // Selalu sinkronkan state terbaru ke global cache
  useEffect(() => { globalBoardCache = board }, [board])
  useEffect(() => { globalMataKuliahCache = mataKuliah }, [mataKuliah])

  // ── Fetch kanban board ─────────────────────────────────────────────────
  const fetchBoard = useCallback(async (force = false) => {
    try {
      if (!globalBoardCache || force) {
        setLoading(true)
      }
      const [kanban, mk] = await Promise.all([
        taskService.getKanban(),
        taskService.getMataKuliah(),
      ])
      setBoard(kanban)
      setMataKuliah(mk)
    } catch {
      toast.error('Gagal memuat data task.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  // ── Create task (FR-04) ────────────────────────────────────────────────
  const createTask = useCallback(async (data) => {
    const task = await taskService.createTask(data)
    setBoard(prev => ({ ...prev, [task.status]: [...prev[task.status], task] }))
    toast.success('Task berhasil dibuat!')
    return task
  }, [])

  // ── Update task (FR-05) ────────────────────────────────────────────────
  const updateTask = useCallback(async (id, data) => {
    const updated = await taskService.updateTask(id, data)
    setBoard(prev => {
      const next = { ...prev }
      for (const col of ['todo', 'in_progress', 'done']) {
        next[col] = next[col].map(t => t.id === id ? updated : t)
      }
      return next
    })
    toast.success('Task berhasil diperbarui!')
    return updated
  }, [])

  // ── Delete task (FR-05) ────────────────────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    await taskService.deleteTask(id)
    setBoard(prev => {
      const next = { ...prev }
      for (const col of ['todo', 'in_progress', 'done']) {
        next[col] = next[col].filter(t => t.id !== id)
      }
      return next
    })
    toast.success('Task berhasil dihapus.')
  }, [])

  // ── Move task – dipanggil setelah optimistic update di KanbanBoard ─────
  // KanbanBoard sudah update board state via setBoard sebelum memanggil ini
  const moveTask = useCallback(async (taskId, fromCol, toCol, toIndex) => {
    try {
      await taskService.moveTask(taskId, toCol, toIndex)
    } catch {
      toast.error('Gagal menyimpan perubahan posisi task.')
      // Rollback: refetch dari server
      fetchBoard()
    }
  }, [fetchBoard])

  return {
    board,
    setBoard,      // ← diekspos untuk optimistic update drag di KanbanBoard
    mataKuliah,
    loading,
    fetchBoard,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  }
}
