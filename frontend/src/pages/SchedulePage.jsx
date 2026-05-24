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

  return (
    <AppLayout>
      <div className="p-8">
        
         {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-100 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {role === 'umum' 
                ? 'Jadwal & Kalender' 
                : role === 'mahasiswa' 
                ? 'Jadwal & Kalender Akademik' 
                : 'Jadwal Kuliah & Kalender'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'umum' 
                ? 'Pantau jadwal kegiatan mingguan dan tenggat waktu tugas Anda secara terintegrasi'
                : role === 'mahasiswa'
                ? 'Pantau jadwal kuliah Ruang Edukasi Anda dan kelola agenda pribadi secara terpadu'
                : 'Pantau jadwal kuliah mingguan dan tenggat waktu akademis Anda secara terintegrasi'}
            </p>
          </div>
          
          {role !== 'dosen' && (
            <button 
              className="rounded-lg bg-[#4B3A2F] hover:bg-[#3d3025] px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm self-start md:self-auto"
              onClick={() => {
                setEditingMk(null)
                setShowMataKuliahModal(true)
              }}
            >
              <Plus size={14} />
              {role === 'umum' 
                ? 'Tambah Jadwal Kegiatan' 
                : 'Tambah Agenda Pribadi'}
            </button>
          )}
        </div>

        {/* 1. SEKTOR UTAMA: KALENDER BULANAN & SIDEBAR AGENDA */}
        <div className="mb-8">
          <CalendarView 
            tasks={tasks}
            mataKuliah={mataKuliah}
            onTaskClick={(taskId) => {
              // Redirect to tasks page and let them view it there, or give a friendly toast
              toast.success('Pindah ke tab Tugas Akademik untuk melihat detail tugas ini!')
            }}
            onDateClick={(dateStr) => {
              navigate(`/tasks?add=true&date=${dateStr}`)
            }}
            roleView={role}
          />
        </div>

        {/* 2. SEKTOR BAWAH: TIMETABLE MINGGUAN (GROUPED BY DAYS) */}
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Sparkles size={18} className="text-[#B8842A]" />
            <h2 className="text-lg font-bold text-slate-800">Timetable Mingguan</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#374151', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 0].map(dayKey => {
                const dayClasses = groupedSchedules[dayKey] || []
                return (
                  <div key={dayKey} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[220px]">
                    <div className="bg-slate-50/75 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">{DAYS_MAP[dayKey]}</span>
                      <span className="bg-slate-200/60 text-slate-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
                        {dayClasses.length} {role === 'umum' ? 'Kegiatan' : 'Kelas'}
                      </span>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col gap-3">
                      {dayClasses.length === 0 ? (
                        <span className="text-xs text-slate-400 font-medium italic my-auto text-center">
                          {role === 'umum' ? 'Tidak ada jadwal kegiatan' : 'Tidak ada jadwal kuliah'}
                        </span>
                      ) : (
                        dayClasses.map(mk => (
                          <div 
                            key={mk.id} 
                            className="bg-white border border-slate-100 p-3 rounded-xl flex flex-col gap-2 relative group hover:border-slate-200 transition"
                            style={{ borderLeft: `4px solid ${mk.warna || '#B8842A'}` }}
                          >
                            {/* Card Header & Actions */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-bold text-xs text-slate-800 leading-tight truncate">{mk.nama}</span>
                                {mk.is_academic && (
                                  <span className="inline-flex items-center text-[8px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.5 rounded uppercase tracking-wider self-start mt-1 select-none">
                                    🔒 Akademik
                                  </span>
                                )}
                              </div>
                              
                              {!mk.is_academic && (
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition absolute right-2 top-2 bg-white/95 p-0.5 rounded-lg shadow-sm">
                                  <button 
                                    onClick={() => {
                                      setEditingMk(mk)
                                      setShowMataKuliahModal(true)
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition"
                                    title="Edit"
                                  >
                                    <Edit2 size={10} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteMataKuliah(mk.id)}
                                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition"
                                    title="Hapus"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            {mk.nama_dosen && (
                              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                <UserRound size={10} />
                                {mk.nama_dosen}
                              </span>
                            )}
                            
                            <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold mt-1">
                              {mk.jam_mulai && mk.jam_selesai && (
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {mk.jam_mulai.substring(0, 5)} - {mk.jam_selesai.substring(0, 5)}
                                </span>
                              )}
                              {mk.ruangan && (
                                <span className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 max-w-[100px] truncate" title={mk.ruangan}>
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
