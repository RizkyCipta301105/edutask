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

      <div className="mb-6 flex gap-4 border-b-4 border-black">
        <button 
          className={`pb-3 text-sm font-black uppercase transition-colors relative ${activeTab === 'buat_tugas' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          onClick={() => setActiveTab('buat_tugas')}
        >
          Formulir Penugasan
          {activeTab === 'buat_tugas' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-black" />
          )}
        </button>
        <button 
          className={`pb-3 text-sm font-black uppercase transition-colors relative ${activeTab === 'riwayat' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          onClick={() => setActiveTab('riwayat')}
        >
          Riwayat & Tracker Progress
          {activeTab === 'riwayat' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-black" />
          )}
        </button>
      </div>

      {activeTab === 'buat_tugas' && (
        <form onSubmit={handleBroadcast} className="max-w-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-black uppercase tracking-wider text-black">Judul Tugas</label>
              <input type="text" value={judul} onChange={e => setJudul(e.target.value)} required className="w-full border-4 border-black p-3 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors" placeholder="Contoh: Laporan Pratikum Modul 3" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-black uppercase tracking-wider text-black">Deskripsi / Instruksi</label>
              <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows="4" className="w-full border-4 border-black p-3 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors resize-none" placeholder="Berikan instruksi yang jelas untuk mahasiswa..."></textarea>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-wider text-black">Batas Waktu (Deadline)</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[3]" />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full border-4 border-black p-3 pl-10 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-wider text-black">Tingkat Prioritas</label>
              <div className="relative">
                <AlertCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[3]" />
                <select value={prioritas} onChange={e => setPrioritas(e.target.value)} className="w-full appearance-none border-4 border-black bg-white p-3 pl-10 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors">
                  <option value="rendah">Rendah (Low)</option>
                  <option value="sedang">Sedang (Medium)</option>
                  <option value="tinggi">Tinggi (High)</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-black uppercase tracking-wider text-black">Pilih Ruang Edukasi Tujuan</label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {ruangList.map(ruang => (
                  <label key={ruang.id} className={`flex cursor-pointer items-center gap-2 border-4 border-black p-3 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${selectedRuang.includes(ruang.id) ? 'bg-[#fbcfe8] text-black' : 'bg-white hover:bg-yellow-100 text-black'}`}>
                    <input type="checkbox" className="hidden" checked={selectedRuang.includes(ruang.id)} onChange={() => toggleRuang(ruang.id)} />
                    <div className={`flex h-5 w-5 items-center justify-center border-4 border-black ${selectedRuang.includes(ruang.id) ? 'bg-[#ea580c]' : 'bg-white'}`}>
                      {selectedRuang.includes(ruang.id) && <Check size={14} className="stroke-[3] text-white" />}
                    </div>
                    <span className="text-sm font-black uppercase line-clamp-1" title={ruang.nama_ruang}>{ruang.nama_ruang}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 border-4 border-black bg-[#ea580c] px-6 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#c2410c] hover:translate-y-1 hover:translate-x-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed">
              <Send size={16} className="stroke-[3]" />
              {loading ? 'Menyebarkan...' : 'Sebarkan ke Kanban Mahasiswa'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'riwayat' && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {penugasanList.map(tugas => (
            <div key={tugas.id} className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-black text-xl uppercase text-black">{tugas.judul}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tugas.ruang_detail?.map(r => (
                      <span key={r.id} className="border-2 border-black bg-blue-200 px-2 py-0.5 text-xs font-black uppercase text-black">
                        {r.nama} ({r.mahasiswa_count} Mhs)
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`flex items-center border-2 border-black px-2 text-xs font-black uppercase tracking-wider ${tugas.prioritas === 'tinggi' ? 'bg-red-500 text-white' : tugas.prioritas === 'sedang' ? 'bg-yellow-400 text-black' : 'bg-green-400 text-black'}`}>
                    {tugas.prioritas}
                  </span>
                  <button 
                    onClick={() => handleDeletePenugasan(tugas.id)}
                    className="flex items-center justify-center border-2 border-black bg-red-500 px-2 py-1 text-white transition-colors hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"
                    title="Hapus Penugasan & Cabut dari Mahasiswa"
                  >
                    <AlertCircle size={14} className="mr-1 stroke-[3]" />
                    <span className="text-xs font-black uppercase">Hapus</span>
                  </button>
                </div>
              </div>
              <p className="mb-4 text-sm font-bold text-gray-700 line-clamp-2">{tugas.deskripsi || 'Tidak ada deskripsi'}</p>
              
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-black border-l-4 border-black pl-3 py-1 bg-yellow-100">
                <Calendar size={16} className="stroke-[3]" /> <span>Deadline: {new Date(tugas.deadline).toLocaleDateString('id-ID')}</span>
              </div>

              {/* Progress Tracker Bar */}
              {tugas.progress_stats && (
                <div className="mb-4 border-t-4 border-black pt-4">
                  <div className="mb-2 flex items-center justify-between text-sm font-black uppercase">
                    <span className="text-black">Progress Pengerjaan</span>
                    <span className="text-black bg-yellow-300 px-2 border-2 border-black">{tugas.progress_stats.percentage}% Selesai</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden border-2 border-black bg-white">
                    <div 
                      className="h-full bg-green-400 transition-all duration-1000 ease-out border-r-2 border-black"
                      style={{ width: `${tugas.progress_stats.percentage}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-black uppercase text-black">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1"><div className="h-3 w-3 border-2 border-black bg-green-400"></div> {tugas.progress_stats.done} Selesai</span>
                      <span className="flex items-center gap-1"><div className="h-3 w-3 border-2 border-black bg-yellow-400"></div> {tugas.progress_stats.in_progress} Proses</span>
                      <span className="flex items-center gap-1"><div className="h-3 w-3 border-2 border-black bg-gray-300"></div> {tugas.progress_stats.todo} Belum</span>
                    </div>
                    <span className="font-black bg-white px-2 border-2 border-black">{tugas.progress_stats.total} Total</span>
                  </div>
                </div>
              )}

              {!progressData[tugas.id] ? (
                <button onClick={() => fetchProgress(tugas.id)} className="w-full border-4 border-black py-2 text-sm font-black uppercase text-black bg-white hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-1 hover:translate-x-1 hover:shadow-none flex items-center justify-center gap-2 mt-2">
                  <Users size={18} className="stroke-[3]" /> Lihat Detail Tiap Mahasiswa
                </button>
              ) : (
                <div className="border-4 border-black bg-gray-100 p-3 mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="mb-2 text-sm font-black uppercase text-black">Detail & Progress Mahasiswa:</div>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {progressData[tugas.id]?.details?.map((mhs, idx) => (
                      <div key={idx} className="flex items-center justify-between border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex flex-col">
                           <span className="text-sm font-black uppercase text-black">{mhs.mahasiswa_nama}</span>
                           <span className="text-xs font-bold text-gray-700">{mhs.mahasiswa_kelas}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`text-xs px-2 py-1 border-2 border-black font-black uppercase ${mhs.status_raw === 'done' ? 'bg-green-400 text-black' : mhs.status_raw === 'in_progress' ? 'bg-blue-300 text-black' : 'bg-gray-200 text-black'}`}>
                             {mhs.status_raw === 'done' ? 'Selesai' : mhs.status_raw === 'in_progress' ? 'Proses' : 'To Do'}
                           </span>
                           {mhs.has_attachment && <span title="Ada Lampiran" className="text-blue-500 text-sm">📎</span>}
                           <button 
                             onClick={() => onTaskClick && onTaskClick(mhs.task_id)}
                             className="text-xs border-2 border-black px-2 py-1 bg-white hover:bg-yellow-300 text-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                           >
                             Buka
                           </button>
                        </div>
                      </div>
                    ))}
                    {(!progressData[tugas.id]?.details || progressData[tugas.id].details.length === 0) && (
                      <div className="text-sm font-bold text-gray-500 text-center py-2">Belum ada data mahasiswa.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {penugasanList.length === 0 && (
            <div className="col-span-full border-4 border-black border-dashed py-12 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Users size={40} className="mx-auto mb-3 text-black stroke-[3]" />
              <p className="text-lg font-black uppercase text-black">Belum ada riwayat penugasan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
