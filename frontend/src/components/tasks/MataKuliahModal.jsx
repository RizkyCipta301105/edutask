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
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-white w-full max-w-[500px] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase">
            {initialData || matchedId
              ? (isUmum ? 'Edit Jadwal Kegiatan / Agenda' : 'Edit Jadwal Mata Kuliah')
              : (isUmum ? 'Tambah Jadwal Kegiatan' : 'Tambah Jadwal Kuliah')
            }
          </h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={24} className="stroke-[3]" /></button>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border-4 border-black text-red-600 font-bold p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-sm font-black uppercase tracking-wider text-black">
              {isUmum ? 'Nama Kegiatan / Agenda *' : 'Nama Mata Kuliah / Agenda *'}
            </label>
            <div className="relative">
              <Book size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-2" />
              <input type="text" value={formData.nama} onChange={handleNameChange} placeholder={isUmum ? 'Contoh: Olahraga Pagi / Rapat' : 'Contoh: Pemrograman Web'} className="w-full pl-10 pr-3 py-3 border-4 border-black bg-white font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 transition-colors" required />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-black uppercase tracking-wider text-black">
              {isUmum ? 'Penyelenggara / Kontak' : 'Nama Dosen / Pengajar'}
            </label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-2" />
              <input type="text" value={formData.nama_dosen} onChange={e => setFormData(prev => ({...prev, nama_dosen: e.target.value}))} placeholder={isUmum ? 'Contoh: Budi (opsional)' : 'Contoh: Dr. Ir. Ahmad'} className="w-full pl-10 pr-3 py-3 border-4 border-black bg-white font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block mb-2 text-sm font-black uppercase tracking-wider text-black">Hari</label>
              <div className="relative">
                <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-2" />
                <select value={formData.hari} onChange={e => setFormData(prev => ({...prev, hari: e.target.value === '' ? '' : parseInt(e.target.value)}))} className="w-full pl-10 pr-3 py-3 border-4 border-black bg-white font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 transition-colors">
                  <option value="">-- Bebas / Tidak ada hari rutin --</option>
                  {hariOptions.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-black uppercase tracking-wider text-black">Jam Mulai</label>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-2" />
                <input type="time" value={formData.jam_mulai} onChange={e => setFormData(prev => ({...prev, jam_mulai: e.target.value}))} className="w-full pl-10 pr-3 py-3 border-4 border-black bg-white font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-black uppercase tracking-wider text-black">Jam Selesai</label>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-2" />
                <input type="time" value={formData.jam_selesai} onChange={e => setFormData(prev => ({...prev, jam_selesai: e.target.value}))} className="w-full pl-10 pr-3 py-3 border-4 border-black bg-white font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 transition-colors" />
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-black uppercase tracking-wider text-black">Warna Label</label>
            <div className="flex gap-2">
              {['#8B6914', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6'].map(color => (
                <div 
                  key={color}
                  onClick={() => setFormData({ ...formData, warna: color })}
                  className={`w-8 h-8 cursor-pointer border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-none transition-all ${formData.warna === color ? 'ring-4 ring-black ring-offset-2' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t-4 border-black">
            {(initialData?.id || matchedId) && !initialData?.is_academic && (
              <button 
                type="button" 
                onClick={handleDelete} 
                disabled={loading}
                className="px-5 py-3 border-4 border-black bg-red-500 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all mr-auto"
              >
                Hapus Kelas
              </button>
            )}
            <button type="button" onClick={onClose} className="px-5 py-3 border-4 border-black bg-white font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-3 border-4 border-black bg-[#ea580c] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#c2410c] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
