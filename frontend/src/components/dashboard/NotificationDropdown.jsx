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
        className="btn-icon" 
        onClick={() => setIsOpen(!isOpen)} 
        title="Notifikasi"
        style={{ position: 'relative' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 6,
            width: 8,
            height: 8,
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white'
          }} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 8,
          width: 320,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => handleMarkAsRead()}
                style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>Memuat...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                Belum ada notifikasi
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: notif.is_read ? 'white' : '#eff6ff',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    cursor: notif.is_read ? 'default' : 'pointer'
                  }}
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                >
                  <div style={{ marginTop: 2 }}>
                    <CheckCircle size={16} color={notif.is_read ? '#9ca3af' : '#2563eb'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: notif.is_read ? '#4b5563' : '#111827', marginBottom: 4 }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.4 }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 6 }}>
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
