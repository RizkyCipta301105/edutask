/**
 * EduTask Task Service
 * FR-04: Pembuatan Task
 * FR-05: Edit & Hapus Task
 * FR-07: Kanban Board
 */
import api from './api'

const BASE = '/api/tasks'

const taskService = {
  // ── Mata Kuliah ────────────────────────────────────────────────────────
  getMataKuliah: async () => {
    const res = await api.get(`${BASE}/mata-kuliah/`)
    return res.data.data
  },
  createMataKuliah: async (data) => {
    const res = await api.post(`${BASE}/mata-kuliah/`, data)
    return res.data.data
  },
  updateMataKuliah: async (id, data) => {
    const res = await api.put(`${BASE}/mata-kuliah/${id}/`, data)
    return res.data.data
  },
  deleteMataKuliah: async (id) => {
    await api.delete(`${BASE}/mata-kuliah/${id}/`)
  },

  // ── Tasks (FR-04, FR-05) ───────────────────────────────────────────────
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status)      params.append('status', filters.status)
    if (filters.prioritas)   params.append('prioritas', filters.prioritas)
    if (filters.mata_kuliah) params.append('mata_kuliah', filters.mata_kuliah)
    if (filters.search)      params.append('search', filters.search)
    const res = await api.get(`${BASE}/?${params.toString()}`)
    return res.data.data
  },
  createTask: async (data) => {
    const res = await api.post(`${BASE}/`, data)
    return res.data.data
  },
  updateTask: async (id, data) => {
    const res = await api.put(`${BASE}/${id}/`, data)
    return res.data.data
  },
  deleteTask: async (id) => {
    await api.delete(`${BASE}/${id}/`)
  },

  // ── Kanban (FR-07) ─────────────────────────────────────────────────────
  getKanban: async () => {
    const res = await api.get(`${BASE}/kanban/`)
    return res.data.data  // { todo: [], in_progress: [], done: [] }
  },
  moveTask: async (id, status, urutan = 0) => {
    const res = await api.patch(`${BASE}/${id}/move/`, { status, urutan })
    return res.data.data
  },
}

export default taskService
