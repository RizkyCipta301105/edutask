import React, { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  const prevNotifsRef = useRef([])

  // Request desktop notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const fetchNotifications = async (isFirstMount = false) => {
    try {
      setLoading(true)
      const response = await api.get('/api/tasks/notifications/')
      const fetched = response.data.data || []
      
      // Push desktop notification for newly generated unread alerts
      if (!isFirstMount && fetched.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        const newUnread = fetched.filter(n => !n.is_read && !prevNotifsRef.current.some(prev => prev.id === n.id))
        newUnread.forEach(n => {
          new window.Notification(n.title, {
            body: n.message,
            icon: '/favicon.ico'
          })
        })
      }
      
      prevNotifsRef.current = fetched
      setNotifications(fetched)
    } catch (err) {
      console.error('Failed to load notifications', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications(true)
    // Poll every 30 seconds to fetch dynamically generated deadline alerts
    const interval = setInterval(() => fetchNotifications(false), 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id = null) => {
    try {
      const url = id ? `/api/tasks/notifications/${id}/read/` : '/api/tasks/notifications/read/'
      await api.patch(url)
      fetchNotifications()
      if (!id) {
        toast.success('Semua notifikasi ditandai telah dibaca')
        setIsOpen(false)
      }
    } catch (err) {
      toast.error('Gagal memperbarui notifikasi')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex h-10 w-10 items-center justify-center border-4 border-black bg-[#fef08a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" 
        onClick={() => setIsOpen(!isOpen)} 
        title="Notifikasi"
      >
        <Bell size={20} className="stroke-[3] text-black" />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border-2 border-black bg-[#ea580c] text-xs font-black text-white rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between border-b-4 border-black bg-[#fef08a] px-4 py-3">
            <h3 className="text-sm font-black uppercase text-black">Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => handleMarkAsRead()}
                className="text-xs font-black uppercase text-blue-700 hover:text-blue-900 hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto bg-white">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-sm font-black uppercase text-gray-500">Memuat...</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                <Bell size={32} className="mb-4 stroke-[2] opacity-50" />
                <span className="text-sm font-black uppercase">Belum ada notifikasi</span>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`flex cursor-pointer gap-3 border-b-4 border-black p-4 transition-colors ${notif.is_read ? 'bg-white hover:bg-gray-100' : 'bg-blue-100 hover:bg-blue-200'}`}
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                >
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle size={20} className={`stroke-[3] ${notif.is_read ? 'text-gray-400' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`mb-1 text-sm uppercase ${notif.is_read ? 'font-bold text-gray-600' : 'font-black text-black'}`}>
                      {notif.title}
                    </div>
                    <div className="text-xs font-semibold leading-relaxed text-gray-800">
                      {notif.message}
                    </div>
                    <div className="mt-2 text-[10px] font-black uppercase text-gray-500">
                      {new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
