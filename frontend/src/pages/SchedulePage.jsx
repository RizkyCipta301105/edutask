import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, BookOpen, Clock, MapPin, Plus, Trash2, Edit2, UserRound, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'
import { normalizeUserRole } from '../utils/authHelpers'
import taskService from '../services/taskService'
import AppLayout from '../components/common/AppLayout'
import CalendarView from '../components/dashboard/CalendarView'
import MataKuliahModal from '../components/tasks/MataKuliahModal'

const DAYS_MAP = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  0: 'Minggu'
}

export default function SchedulePage() {
  const { user } = useAuth()
  const role = normalizeUserRole(user)
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [mataKuliah, setMataKuliah] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [showMataKuliahModal, setShowMataKuliahModal] = useState(false)
  const [editingMk, setEditingMk] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasksData, mkData] = await Promise.all([
        taskService.getTasks(),
        taskService.getMataKuliah()
      ])
      setTasks(tasksData)
      setMataKuliah(mkData)
    } catch (err) {
      console.error("Gagal memuat jadwal:", err)
      toast.error('Gagal memuat data jadwal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Group mata kuliah by day of the week
  const groupedSchedules = useMemo(() => {
    const groups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] }
    mataKuliah.forEach(mk => {
      if (mk.hari !== null && mk.hari !== undefined) {
        if (groups[mk.hari]) {
          groups[mk.hari].push(mk)
        }
      }
    })
    return groups
  }, [mataKuliah])

  const handleSaveMataKuliah = async (payload, id) => {
    try {
      if (id) {
        await taskService.updateMataKuliah(id, payload)
        toast.success('Jadwal kuliah diperbarui.')
      } else {
        await taskService.createMataKuliah(payload)
        toast.success('Jadwal kuliah berhasil ditambahkan.')
      }
      setShowMataKuliahModal(false)
      setEditingMk(null)
      fetchData()
    } catch (err) {
      console.error("Gagal menyimpan mata kuliah:", err)
      toast.error('Gagal menyimpan jadwal kuliah.')
    }
  }

  const handleDeleteMataKuliah = async (id) => {
    try {
      await taskService.deleteMataKuliah(id)
      toast.success('Jadwal kuliah berhasil dihapus.')
      fetchData()
    } catch (err) {
      console.error("Gagal menghapus mata kuliah:", err)
      toast.error('Gagal menghapus jadwal kuliah.')
    }
  }

  const handleCleanup = async () => {
    if (!window.confirm('Bersihkan jadwal ganda? Jadwal pribadi yang namanya sama dengan jadwal akademik akan dihapus.')) return;
    try {
      setLoading(true)
      const res = await taskService.cleanupMataKuliah()
      toast.success(res?.message || 'Pembersihan selesai.')
      fetchData()
    } catch (err) {
      console.error("Gagal membersihkan data:", err)
      toast.error('Gagal membersihkan data ganda.')
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        
        {/* ── Neo-Brut Header ── */}
        <div className="relative mb-6 md:mb-8 overflow-hidden border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FF6B9D]">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0, #000 1.5px, transparent 0, transparent 12px)', backgroundSize: '100% 12px' }} />
          
          <div className="relative z-10 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="inline-block bg-black text-white font-black text-xs uppercase px-3 py-1 mb-2 rotate-1">
                  Kalender Akademik
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase leading-none" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
                  {role === 'umum' 
                    ? 'Jadwal & Kalender' 
                    : role === 'mahasiswa' 
                    ? 'Jadwal Akademik' 
                    : 'Jadwal Kuliah'}
                </h1>
                <div className="mt-2 border-[3px] border-black bg-white inline-block px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                  <span className="font-black text-black text-xs md:text-sm uppercase">
                    {role === 'umum' 
                      ? 'Jadwal kegiatan & tenggat waktu'
                      : role === 'mahasiswa'
                      ? 'Jadwal kuliah & agenda pribadi'
                      : 'Jadwal kuliah & tenggat waktu'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 self-start">
                {role === 'mahasiswa' && (
                  <button 
                    className="border-[4px] border-black bg-white px-5 py-3 font-black uppercase text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none hover:bg-red-100 transition-all flex items-center gap-2 cursor-pointer text-xs md:text-sm"
                    onClick={handleCleanup}
                  >
                    <Trash2 size={16} className="stroke-[3] text-red-600" />
                    Bersihkan Ganda
                  </button>
                )}
                {role !== 'dosen' && (
                  <button 
                    className="border-[4px] border-black bg-[#FFE500] px-5 py-3 font-black uppercase text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer text-xs md:text-sm"
                    onClick={() => {
                      setEditingMk(null)
                      setShowMataKuliahModal(true)
                    }}
                  >
                    <Plus size={16} className="stroke-[3]" />
                    {role === 'umum' 
                      ? 'Kegiatan' 
                      : 'Agenda'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 1. SEKTOR UTAMA: KALENDER BULANAN & SIDEBAR AGENDA */}
        <div className="mb-8">
          <CalendarView 
            tasks={tasks}
            mataKuliah={mataKuliah}
            onTaskClick={(taskId) => {
              toast.success('Pindah ke tab Tugas Akademik untuk melihat detail tugas ini!')
            }}
            onDateClick={(dateStr) => {
              navigate(`/tasks?add=true&date=${dateStr}`)
            }}
            onTaskMove={async (taskId, newDateStr) => {
              try {
                const taskToUpdate = tasks.find(t => t.id === taskId)
                if (!taskToUpdate) return

                const payload = {
                  deadline: newDateStr
                }

                await taskService.updateTask(taskId, payload)
                toast.success('Deadline tugas berhasil diperbarui!')
                fetchData() // Refresh kalender
              } catch (err) {
                console.error("Gagal memindahkan tugas:", err)
                toast.error('Gagal memindahkan tugas.')
              }
            }}
            roleView={role}
          />
        </div>

        {/* 2. TIMETABLE MINGGUAN */}
        <div>
          <div className="mb-6 flex items-center gap-3 bg-[#FFE500] border-[5px] border-black p-3 md:p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full sm:max-w-sm -rotate-1 hover:rotate-0 transition-transform">
            <Sparkles size={20} className="stroke-2 text-black shrink-0" />
            <h2 className="text-xl md:text-2xl font-black text-black uppercase">Timetable Mingguan</h2>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-4">
              <div className="w-12 h-12 border-[5px] border-black border-t-[#FF4D00] rounded-full animate-spin" />
              <span className="font-black text-black uppercase text-sm border-[3px] border-black bg-[#FFE500] px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Memuat jadwal...</span>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 0].map((dayKey, idx) => {
                const dayClasses = groupedSchedules[dayKey] || []
                // Each day gets a distinct bold Neo-Brut color
                const dayColors = {
                  1: '#ffffff',   // Senin
                  2: '#ffffff',   // Selasa
                  3: '#FFE500',   // Rabu
                  4: '#ffffff',   // Kamis
                  5: '#ffffff',   // Jumat
                  6: '#FFE500',   // Sabtu
                  0: '#ffffff',   // Minggu
                }
                const cardBg = dayColors[dayKey]
                const rotation = ['-rotate-1','rotate-0','rotate-1','rotate-0','-rotate-1','rotate-1','rotate-0'][idx % 7]
                return (
                  <div key={dayKey} className={`border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[240px] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden`} style={{ backgroundColor: cardBg }}>
                    {/* BG dots pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                    
                    {/* Day Header */}
                    <div className="relative z-10 bg-black px-4 py-3 flex items-center justify-between">
                      <span className="font-black text-lg text-white uppercase tracking-wider">{DAYS_MAP[dayKey]}</span>
                      <span className="font-black text-xs uppercase px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] border-[2px] border-white text-white">
                        {dayClasses.length} {role === 'umum' ? 'Acara' : 'Kelas'}
                      </span>
                    </div>
                    
                    <div className="relative z-10 p-3 flex-1 flex flex-col gap-3">
                      {dayClasses.length === 0 ? (
                        <div className="bg-white border-[3px] border-dashed border-black p-3 text-center my-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]">
                          <span className="text-xs font-black text-black uppercase">
                            {role === 'umum' ? 'Kosong' : 'Tidak ada kelas'}
                          </span>
                        </div>
                      ) : (
                        dayClasses.map(mk => (
                          <div 
                            key={mk.id} 
                            className="bg-white border-[4px] border-black p-3 flex flex-col gap-2 relative group transition-all hover:-translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                            style={{ borderLeftColor: mk.warna || '#000', borderLeftWidth: '6px' }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <span className="font-black text-black uppercase leading-tight text-sm truncate">{mk.nama}</span>
                                {mk.is_academic && (
                                  <span className="inline-flex items-center text-[9px] font-black text-white bg-black px-1.5 py-0.5 uppercase tracking-wider self-start mt-0.5">
                                    Akademik
                                  </span>
                                )}
                              </div>
                              
                              {!mk.is_academic && (
                                <div className="flex gap-1.5 shrink-0">
                                  <button 
                                    onClick={() => { setEditingMk(mk); setShowMataKuliahModal(true) }}
                                    className="p-1 border-[2px] border-black bg-[#FFE500] text-black hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                                    title="Edit"
                                  >
                                    <Edit2 size={11} className="stroke-[2.5]" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteMataKuliah(mk.id)}
                                    className="p-1 border-[2px] border-black bg-[#FF6B9D] text-black hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                                    title="Hapus"
                                  >
                                    <Trash2 size={11} className="stroke-[2.5]" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {mk.nama_dosen && (
                              <span className="text-[11px] text-black font-bold flex items-center gap-1 border-t-[2px] border-black pt-1">
                                <UserRound size={11} className="stroke-[2.5]" />
                                {mk.nama_dosen}
                              </span>
                            )}
                            
                            <div className="flex items-center justify-between text-[11px] text-black font-black gap-1 flex-wrap">
                              {mk.jam_mulai && mk.jam_selesai && (
                                <span className="flex items-center gap-1 bg-[#00E676] border-[2px] border-black px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  <Clock size={10} className="stroke-[2.5]" />
                                  {mk.jam_mulai.substring(0, 5)}–{mk.jam_selesai.substring(0, 5)}
                                </span>
                              )}
                              {mk.ruangan && (
                                <span className="bg-white border-[2px] border-black px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-w-[90px] truncate" title={mk.ruangan}>
                                  {mk.ruangan}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* --- MODALS --- */}
      {showMataKuliahModal && (
        <MataKuliahModal
          onClose={() => {
            setShowMataKuliahModal(false)
            setEditingMk(null)
          }}
          onSave={handleSaveMataKuliah}
          initialData={editingMk}
          mataKuliahList={mataKuliah}
        />
      )}
    </AppLayout>
  )
}
