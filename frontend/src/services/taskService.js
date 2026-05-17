/**
 * EduTask Task Service
 * FR-04: Pembuatan Task
 * FR-05: Edit & Hapus Task
 * FR-07: Kanban Board
 */
import api, { buildQueryParams, getResponseData } from './api'

const BASE = '/api/tasks'

const taskService = {
  // ── Mata Kuliah ────────────────────────────────────────────────────────
  getMataKuliah: async () => {
    const res = await api.get(`${BASE}/mata-kuliah/`)
    return getResponseData(res)
  },
  createMataKuliah: async (data) => {
    const res = await api.post(`${BASE}/mata-kuliah/`, data)
    return getResponseData(res)
  },
  updateMataKuliah: async (id, data) => {
    const res = await api.put(`${BASE}/mata-kuliah/${id}/`, data)
    return getResponseData(res)
  },
  deleteMataKuliah: async (id) => {
    await api.delete(`${BASE}/mata-kuliah/${id}/`)
  },

  // ── Tasks (FR-04, FR-05) ───────────────────────────────────────────────
  getTasks: async (filters = {}) => {
    const params = buildQueryParams(filters)
    const query = params.toString()
    const res = await api.get(`${BASE}/${query ? `?${query}` : ''}`)
    return getResponseData(res)
  },
  createTask: async (data) => {
    const res = await api.post(`${BASE}/`, data)
    return getResponseData(res)
  },
  updateTask: async (id, data) => {
    const res = await api.put(`${BASE}/${id}/`, data)
    return getResponseData(res)
  },
  deleteTask: async (id) => {
    await api.delete(`${BASE}/${id}/`)
  },

  // ── Kanban (FR-07) ─────────────────────────────────────────────────────
  getKanban: async () => {
    const res = await api.get(`${BASE}/kanban/`)
    return getResponseData(res)  // { todo: [], in_progress: [], done: [] }
  },
  moveTask: async (id, status, urutan = 0) => {
    const res = await api.patch(`${BASE}/${id}/move/`, { status, urutan })
    return getResponseData(res)
  },
}

export default taskService
