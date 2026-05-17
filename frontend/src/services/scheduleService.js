import api, { buildQueryParams, getResponseData } from './api'

const BASE = '/api/schedules'

const scheduleService = {
  getSchedules: async (filters = {}) => {
    const params = buildQueryParams(filters)
    const query = params.toString()
    const res = await api.get(`${BASE}/${query ? `?${query}` : ''}`)
    return getResponseData(res)
  },
  createSchedule: async (data) => {
    const res = await api.post(`${BASE}/`, data)
    return getResponseData(res)
  },
  updateSchedule: async (id, data) => {
    const res = await api.put(`${BASE}/${id}/`, data)
    return getResponseData(res)
  },
  deleteSchedule: async (id) => {
    await api.delete(`${BASE}/${id}/`)
  },
}

export default scheduleService
