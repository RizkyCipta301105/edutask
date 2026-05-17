import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, SlidersHorizontal, Pencil, Trash2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingState from '../components/common/LoadingState'
import Navbar from '../components/common/Navbar'
import TaskModal from '../components/tasks/TaskModal'
import taskService from '../services/taskService'
import { getApiErrorMessage } from '../utils/apiErrors'
import { PRIORITAS_STYLE, STATUS_META, formatDate } from '../utils/taskHelpers'

const emptyFilters = { search: '', prioritas: '', status: '', mata_kuliah: '' }

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState([])
  const [mataKuliah, setMataKuliah] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [taskData, mkData] = await Promise.all([
        taskService.getTasks(filters),
        taskService.getMataKuliah(),
      ])
      setTasks(taskData)
      setMataKuliah(mkData)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal memuat task.'))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const summary = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    done: tasks.filter(t => t.status === 'done').length,
  }), [tasks])

  const saveTask = async (payload) => {
    try {
      if (editingTask) await taskService.updateTask(editingTask.id, payload)
      else await taskService.createTask(payload)
      toast.success(editingTask ? 'Task diperbarui.' : 'Task dibuat.')
      setModalOpen(false)
      setEditingTask(null)
      fetchData()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal menyimpan task.'))
      throw err
    }
  }

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id)
      toast.success('Task dihapus.')
      fetchData()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal menghapus task.'))
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:pl-[18rem] lg:pt-28">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-950 sm:text-4xl">Task Management</h1>
            <p className="mt-2 text-zinc-500">{summary.total} task, {summary.todo} menunggu, {summary.done} selesai</p>
          </div>
          <button onClick={() => { setEditingTask(null); setModalOpen(true) }} className="btn-primary flex w-full items-center justify-center gap-2 rounded-md sm:w-auto">
            <Plus size={18} />
            Add task
          </button>
        </div>

        <div className="mb-6 grid gap-3 rounded-md border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input className="input-field rounded-md pl-10" placeholder="Search task by title" value={filters.search}
              onChange={(e) => setFilters(v => ({ ...v, search: e.target.value }))} />
          </div>
          <select className="input-field rounded-md" value={filters.prioritas} onChange={(e) => setFilters(v => ({ ...v, prioritas: e.target.value }))}>
            <option value="">Semua prioritas</option>
            <option value="tinggi">Tinggi</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
          </select>
          <select className="input-field rounded-md" value={filters.status} onChange={(e) => setFilters(v => ({ ...v, status: e.target.value }))}>
            <option value="">Semua status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select className="input-field rounded-md" value={filters.mata_kuliah} onChange={(e) => setFilters(v => ({ ...v, mata_kuliah: e.target.value }))}>
            <option value="">Semua mata kuliah</option>
            {mataKuliah.map(mk => <option key={mk.id} value={mk.id}>{mk.nama}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-600">
            <SlidersHorizontal size={16} />
            Task list
          </div>
          {loading ? (
            <LoadingState message="Memuat task..." className="min-h-48" />
          ) : tasks.length === 0 ? (
            <p className="p-6 text-zinc-500">Belum ada task yang cocok.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {tasks.map(task => {
                const priority = PRIORITAS_STYLE[task.prioritas]
                const status = STATUS_META[task.status]
                return (
                  <div key={task.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] md:grid-cols-[1fr_150px_150px_150px_96px] md:items-center">
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-950">{task.judul}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{task.deskripsi || 'Tidak ada deskripsi'}</p>
                    </div>
                    <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${priority.bg} ${priority.text}`}>{priority.label}</span>
                    <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${status.bg} ${status.color}`}>{status.label}</span>
                    <span className="flex items-center gap-1 text-sm text-zinc-500"><Calendar size={14} />{formatDate(task.deadline)}</span>
                    <div className="flex gap-2 sm:justify-end md:justify-start">
                      <button onClick={() => { setEditingTask(task); setModalOpen(true) }} className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="rounded-md p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {modalOpen && (
          <TaskModal task={editingTask} mataKuliah={mataKuliah} onSave={saveTask} onClose={() => { setModalOpen(false); setEditingTask(null) }} />
        )}
      </main>
    </div>
  )
}
