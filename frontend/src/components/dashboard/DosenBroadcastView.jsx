import { useState, useEffect } from 'react'
import { Plus, Users, Calendar, AlertCircle, Send, Check } from 'lucide-react'
import authService from '../../services/authService'
import api, { getResponseData } from '../../services/api'
import toast from 'react-hot-toast'

export default function DosenBroadcastView({ user, onTaskClick }) {
  const [ruangList, setRuangList] = useState([])
  const [penugasanList, setPenugasanList] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('buat_tugas') // 'buat_tugas' | 'riwayat'

  // Form State
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [deadline, setDeadline] = useState('')
  const [prioritas, setPrioritas] = useState('sedang')
  const [selectedRuang, setSelectedRuang] = useState([])
  const [progressData, setProgressData] = useState({})

  useEffect(() => {
    fetchRuang()
    fetchRiwayat()
  }, [])

  const fetchRuang = async () => {
    try {
      const data = await authService.getRuang()
      setRuangList(data)
    } catch (err) {
      console.error('Gagal mengambil data ruang', err)
    }
  }

  const fetchRiwayat = async () => {
    try {
      const res = await api.get('/api/tasks/penugasan/')
      setPenugasanList(getResponseData(res))
    } catch (err) {
      console.error('Gagal mengambil riwayat penugasan', err)
    }
  }

  const fetchProgress = async (id) => {
    if (progressData[id]) return // Sudah ada di cache
    try {
      const res = await api.get(`/api/tasks/penugasan/${id}/progress/`)
      setProgressData(prev => ({ ...prev, [id]: getResponseData(res) }))
    } catch (err) {
      console.error('Gagal mengambil progress', err)
    }
  }

  const handleDeletePenugasan = async (id) => {
    if (!window.confirm('Hapus penugasan ini? Semua tugas di Kanban mahasiswa yang berasal dari penugasan ini juga akan ikut terhapus!')) return
    
    try {
      import('../../services/taskService').then(async m => {
        await m.default.deletePenugasan(id)
        toast.success('Penugasan dan semua duplikatnya di mahasiswa berhasil dihapus!')
        fetchRiwayat()
      })
    } catch (err) {
      toast.error('Gagal menghapus penugasan.')
    }
  }

  const toggleRuang = (id) => {
    setSelectedRuang(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    )
  }

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (selectedRuang.length === 0) {
      toast.error('Pilih setidaknya satu ruang tujuan!')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/tasks/penugasan/', {
        judul,
        deskripsi,
        deadline,
        prioritas,
        mata_kuliah: user?.mata_kuliah || 'Umum',
        ruang_tujuan: selectedRuang
      })
      toast.success('Tugas berhasil disebarkan ke Mahasiswa!')
      
      // Reset Form
      setJudul('')
      setDeskripsi('')
      setDeadline('')
      setPrioritas('sedang')
      setSelectedRuang([])
      setActiveTab('riwayat')
      fetchRiwayat()
    } catch (err) {
      toast.error('Gagal menyebarkan tugas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800">Distribusi Tugas (Broadcast)</h2>
        <p className="text-sm text-slate-500">Sebarkan tugas ke banyak kelas sekaligus dan pantau progress pengerjaan mahasiswa.</p>
      </div>

      <div className="mb-6 flex gap-4 border-b border-slate-200">
        <button 
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'buat_tugas' ? 'border-b-2 border-[#4B3A2F] text-[#4B3A2F]' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('buat_tugas')}
        >
          Formulir Penugasan
        </button>
        <button 
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'riwayat' ? 'border-b-2 border-[#4B3A2F] text-[#4B3A2F]' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('riwayat')}
        >
          Riwayat & Tracker Progress
        </button>
      </div>

      {activeTab === 'buat_tugas' && (
        <form onSubmit={handleBroadcast} className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Judul Tugas</label>
              <input type="text" value={judul} onChange={e => setJudul(e.target.value)} required className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-[#4B3A2F] focus:outline-none focus:ring-1 focus:ring-[#4B3A2F]" placeholder="Contoh: Laporan Pratikum Modul 3" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Deskripsi / Instruksi</label>
              <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows="4" className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-[#4B3A2F] focus:outline-none focus:ring-1 focus:ring-[#4B3A2F]" placeholder="Berikan instruksi yang jelas untuk mahasiswa..."></textarea>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Batas Waktu (Deadline)</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full rounded-lg border border-slate-300 p-3 pl-10 text-sm focus:border-[#4B3A2F] focus:outline-none focus:ring-1 focus:ring-[#4B3A2F]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Tingkat Prioritas</label>
              <div className="relative">
                <AlertCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={prioritas} onChange={e => setPrioritas(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-300 bg-white p-3 pl-10 text-sm focus:border-[#4B3A2F] focus:outline-none focus:ring-1 focus:ring-[#4B3A2F]">
                  <option value="rendah">Rendah (Low)</option>
                  <option value="sedang">Sedang (Medium)</option>
                  <option value="tinggi">Tinggi (High)</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Pilih Ruang Edukasi Tujuan</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {ruangList.map(ruang => (
                  <label key={ruang.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${selectedRuang.includes(ruang.id) ? 'border-[#4B3A2F] bg-orange-50/50 text-[#4B3A2F]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                    <input type="checkbox" className="hidden" checked={selectedRuang.includes(ruang.id)} onChange={() => toggleRuang(ruang.id)} />
                    <div className={`flex h-5 w-5 items-center justify-center rounded border ${selectedRuang.includes(ruang.id) ? 'border-[#4B3A2F] bg-[#4B3A2F]' : 'border-slate-300 bg-white'}`}>
                      {selectedRuang.includes(ruang.id) && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium line-clamp-1" title={ruang.nama_ruang}>{ruang.nama_ruang}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#4B3A2F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-70">
              <Send size={16} />
              {loading ? 'Menyebarkan...' : 'Sebarkan ke Kanban Mahasiswa'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'riwayat' && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {penugasanList.map(tugas => (
            <div key={tugas.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{tugas.judul}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tugas.ruang_detail?.map(r => (
                      <span key={r.id} className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {r.nama} ({r.mahasiswa_count} Mhs)
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`flex h-6 items-center rounded px-2 text-xs font-bold uppercase tracking-wider ${tugas.prioritas === 'tinggi' ? 'bg-red-100 text-red-700' : tugas.prioritas === 'sedang' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {tugas.prioritas}
                  </span>
                  <button 
                    onClick={() => handleDeletePenugasan(tugas.id)}
                    className="flex h-6 items-center justify-center rounded border border-red-200 bg-red-50 px-2 text-red-600 transition-colors hover:bg-red-100"
                    title="Hapus Penugasan & Cabut dari Mahasiswa"
                  >
                    <AlertCircle size={14} className="mr-1" />
                    <span className="text-[10px] font-bold uppercase">Hapus</span>
                  </button>
                </div>
              </div>
              <p className="mb-4 text-xs text-slate-500 line-clamp-2">{tugas.deskripsi || 'Tidak ada deskripsi'}</p>
              
              <div className="mb-4 flex items-center gap-2 text-xs text-slate-600">
                <Calendar size={14} /> <span>Deadline: {new Date(tugas.deadline).toLocaleDateString('id-ID')}</span>
              </div>

              {!progressData[tugas.id] ? (
                <button onClick={() => fetchProgress(tugas.id)} className="w-full rounded border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  Lihat Progress Kelas
                </button>
              ) : (
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 text-xs font-semibold text-slate-700">Detail & Progress Mahasiswa:</div>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {progressData[tugas.id]?.details?.map((mhs, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded border border-slate-200 bg-white p-2">
                        <div className="flex flex-col">
                           <span className="text-xs font-semibold text-slate-700">{mhs.mahasiswa_nama}</span>
                           <span className="text-[10px] text-slate-500">{mhs.mahasiswa_kelas}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${mhs.status_raw === 'done' ? 'bg-green-100 text-green-700' : mhs.status_raw === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                             {mhs.status_raw === 'done' ? 'Selesai' : mhs.status_raw === 'in_progress' ? 'Proses' : 'To Do'}
                           </span>
                           {mhs.has_attachment && <span title="Ada Lampiran" className="text-blue-500 text-xs">📎</span>}
                           <button 
                             onClick={() => onTaskClick && onTaskClick(mhs.task_id)}
                             className="text-[10px] border border-slate-300 rounded px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                           >
                             Buka Tugas
                           </button>
                        </div>
                      </div>
                    ))}
                    {(!progressData[tugas.id]?.details || progressData[tugas.id].details.length === 0) && (
                      <div className="text-xs text-slate-500 text-center py-2">Belum ada data mahasiswa.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {penugasanList.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-12 text-center">
              <Users size={32} className="mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500">Belum ada riwayat penugasan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
