import api, { getResponseData } from './api'

const BASE = '/api/inbox'

const inboxService = {
  getContacts: async () => {
    const res = await api.get(`${BASE}/contacts/`)
    return getResponseData(res)
  },
  getThreads: async () => {
    const res = await api.get(`${BASE}/threads/`)
    return getResponseData(res)
  },
  createThread: async (participants, title = '') => {
    const res = await api.post(`${BASE}/threads/`, { participants, title })
    return getResponseData(res)
  },
  startChatByCode: async (chatCodes, title = '') => {
    const res = await api.post(`${BASE}/start-chat/`, { chat_codes: chatCodes, title })
    return getResponseData(res)
  },
  getMessages: async (threadId) => {
    const res = await api.get(`${BASE}/threads/${threadId}/messages/`)
    return getResponseData(res)
  },
  sendMessage: async (threadId, data) => {
    let headers = {}
    if (data instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' }
    }
    const res = await api.post(`${BASE}/threads/${threadId}/messages/`, data, { headers })
    return getResponseData(res)
  },
  markAsRead: async (threadId) => {
    const res = await api.patch(`${BASE}/threads/${threadId}/read/`)
    return res.data
  },

  editMessage: async (threadId, messageId, text) => {
    const res = await api.patch(`${BASE}/threads/${threadId}/messages/${messageId}/`, { text })
    return getResponseData(res)
  },

  deleteMessage: async (threadId, messageId) => {
    const res = await api.delete(`${BASE}/threads/${threadId}/messages/${messageId}/`)
    return getResponseData(res)
  },

  reactToMessage: async (threadId, messageId, emoji) => {
    const res = await api.post(`${BASE}/threads/${threadId}/messages/${messageId}/react/`, { emoji })
    return getResponseData(res)
  },

  clearChat: async (threadId) => {
    const res = await api.delete(`${BASE}/threads/${threadId}/clear/`)
    return getResponseData(res)
  }
}

export default inboxService
