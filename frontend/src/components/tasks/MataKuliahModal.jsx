import { useState, useEffect } from 'react'
import { X, Clock, MapPin, Calendar as CalendarIcon, User as UserIcon, Book } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { normalizeUserRole } from '../../utils/authHelpers'
import taskService from '../../services/taskService'

export default function MataKuliahModal({ onClose, onSave, initialData = null, mataKuliahList = [] }) {
  const { user } = useAuth()
  const role = normalizeUserRole(user)
  const isUmum = role === 'umum'

  const [formData, setFormData] = useState({
    nama: '',
    nama_dosen: '',
    warna: '#8B6914',
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    ruangan: ''
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [matchedId, setMatchedId] = useState(initialData?.id || null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama || '',
        nama_dosen: initialData.nama_dosen || '',
        warna: initialData.warna || '#8B6914',
        hari: initialData.hari !== null ? initialData.hari : '',
        jam_mulai: initialData.jam_mulai || '',
        jam_selesai: initialData.jam_selesai || '',
        ruangan: initialData.ruangan || ''
      })
    }
  }, [initialData])

  const handleNameChange = (e) => {
    const val = e.target.value
    setFormData(prev => ({ ...prev, nama: val }))

    if (!initialData) {
      const existing = mataKuliahList.find(mk => mk.nama.toLowerCase() === val.toLowerCase())
      if (existing) {
        setMatchedId(existing.id)
        setFormData(prev => ({
          ...prev,
          nama: existing.nama, // Ensure exact casing
          nama_dosen: existing.nama_dosen || prev.nama_dosen,
          warna: existing.warna || prev.warna,
          hari: existing.hari !== null ? existing.hari : prev.hari,
          jam_mulai: existing.jam_mulai || prev.jam_mulai,
          jam_selesai: existing.jam_selesai || prev.jam_selesai,
          ruangan: existing.ruangan || prev.ruangan
        }))
      } else {
        setMatchedId(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nama) {
      setErrorMsg('Nama Mata Kuliah wajib diisi')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      // Parse empty strings to null for time/hari
      const payload = { ...formData }
      if (payload.hari === '') payload.hari = null
      if (payload.jam_mulai === '') payload.jam_mulai = null
      if (payload.jam_selesai === '') payload.jam_selesai = null
      
      await onSave(payload, matchedId || initialData?.id)
      onClose()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan mata kuliah.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const targetId = matchedId || initialData?.id
    if (!targetId) return

    if (!window.confirm('Yakin ingin menghapus kelas/kategori ini? Semua tugas dengan kategori ini akan dilepas kategorinya.')) return

    setLoading(true)
    setErrorMsg('')
    try {
      await taskService.deleteMataKuliah(targetId)
      onClose()
      window.location.reload()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus kelas/kategori.')
    } finally {
      setLoading(false)
    }
  }

  const hariOptions = [
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
    { value: 0, label: 'Minggu' }
  ]

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" style={{ background: 'white', width: '100%', maxWidth: 500, borderRadius: 12, padding: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {initialData || matchedId
              ? (isUmum ? 'Edit Jadwal Kegiatan / Agenda' : 'Edit Jadwal Mata Kuliah')
              : (isUmum ? 'Tambah Jadwal Kegiatan' : 'Tambah Jadwal Kuliah')
            }
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#6b7280" /></button>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: 6, marginBottom: 16, fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>
              {isUmum ? 'Nama Kegiatan / Agenda *' : 'Nama Mata Kuliah / Agenda *'}
            </label>
            <div style={{ position: 'relative' }}>
              <Book size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
              <input type="text" value={formData.nama} onChange={handleNameChange} placeholder={isUmum ? 'Contoh: Olahraga Pagi / Rapat' : 'Contoh: Pemrograman Web'} style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid #d1d5db' }} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>
              {isUmum ? 'Penyelenggara / Kontak' : 'Nama Dosen / Pengajar'}
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
              <input type="text" value={formData.nama_dosen} onChange={e => setFormData({ ...formData, nama_dosen: e.target.value })} placeholder={isUmum ? 'Nama Penyelenggara (Opsional)' : 'Opsional'} style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Hari</label>
              <div style={{ position: 'relative' }}>
                <CalendarIcon size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                <select value={formData.hari} onChange={e => setFormData({ ...formData, hari: e.target.value })} style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid #d1d5db', backgroundColor: 'white' }}>
                  <option value="">-- Pilih Hari --</option>
                  {hariOptions.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Ruangan / Link Zoom</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                <input type="text" value={formData.ruangan} onChange={e => setFormData({ ...formData, ruangan: e.target.value })} placeholder="Opsional" style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Jam Mulai</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                <input type="time" value={formData.jam_mulai} onChange={e => setFormData({ ...formData, jam_mulai: e.target.value })} style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Jam Selesai</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                <input type="time" value={formData.jam_selesai} onChange={e => setFormData({ ...formData, jam_selesai: e.target.value })} style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Warna Label</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['#8B6914', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6'].map(color => (
                <div 
                  key={color}
                  onClick={() => setFormData({ ...formData, warna: color })}
                  style={{ 
                    width: 24, height: 24, borderRadius: '50%', backgroundColor: color, cursor: 'pointer',
                    border: formData.warna === color ? '2px solid #111827' : '2px solid transparent',
                    boxShadow: formData.warna === color ? '0 0 0 2px white inset' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div>
              {(initialData?.id || matchedId) && !initialData?.is_academic && (
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  disabled={loading}
                  style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}
                >
                  Hapus Kelas
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Batal</button>
              <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#111827', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
