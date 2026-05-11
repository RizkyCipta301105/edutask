import api from './api'

const BASE = '/api/schedules'

const scheduleService = {
  getSchedules: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.hari) params.append('hari', filters.hari)
    const res = await api.get(`${BASE}/?${params.toString()}`)
    return res.data.data
  },
  createSchedule: async (data) => {
    const res = await api.post(`${BASE}/`, data)
    return res.data.data
  },
  updateSchedule: async (id, data) => {
    const res = await api.put(`${BASE}/${id}/`, data)
    return res.data.data
  },
  deleteSchedule: async (id) => {
    await api.delete(`${BASE}/${id}/`)
  },
}

export default scheduleService
