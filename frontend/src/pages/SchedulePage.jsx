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
      <div className="p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-4 border-black pb-6 gap-4 bg-pink-300 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h1 className="text-4xl font-black text-black uppercase">
              {role === 'umum' 
                ? 'Jadwal & Kalender' 
                : role === 'mahasiswa' 
                ? 'Jadwal & Kalender Akademik' 
                : 'Jadwal Kuliah & Kalender'}
            </h1>
            <p className="font-bold text-black border-2 border-black bg-white inline-block px-3 py-1 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {role === 'umum' 
                ? 'Pantau jadwal kegiatan mingguan dan tenggat waktu'
                : role === 'mahasiswa'
                ? 'Pantau jadwal kuliah dan kelola agenda pribadi'
                : 'Pantau jadwal kuliah mingguan dan tenggat waktu'}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 self-start md:self-auto">
            {role === 'mahasiswa' && (
              <button 
                className="border-4 border-black bg-white px-6 py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer"
                onClick={handleCleanup}
              >
                <Trash2 size={20} className="stroke-2 text-red-500" />
                Bersihkan Ganda
              </button>
            )}
            {role !== 'dosen' && (
              <button 
                className="border-4 border-black bg-yellow-300 px-6 py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setEditingMk(null)
                  setShowMataKuliahModal(true)
                }}
              >
                <Plus size={20} className="stroke-2" />
                {role === 'umum' 
                  ? 'Tambah Kegiatan' 
                  : 'Tambah Agenda Pribadi'}
              </button>
            )}
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

        {/* 2. SEKTOR BAWAH: TIMETABLE MINGGUAN (GROUPED BY DAYS) */}
        <div>
          <div className="mb-6 flex items-center gap-2 bg-yellow-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm rotate-1">
            <Sparkles size={24} className="stroke-2 text-black" />
            <h2 className="text-2xl font-black text-black uppercase">Timetable Mingguan</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div style={{ width: 40, height: 40, border: '4px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 0].map(dayKey => {
                const dayClasses = groupedSchedules[dayKey] || []
                return (
                  <div key={dayKey} className="bg-blue-300 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[220px]">
                    <div className="bg-white border-b-4 border-black px-4 py-3 flex items-center justify-between">
                      <span className="font-black text-lg text-black uppercase tracking-wider">{DAYS_MAP[dayKey]}</span>
                      <span className="bg-yellow-300 border-2 border-black text-black px-2 py-0.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {dayClasses.length} {role === 'umum' ? 'Kegiatan' : 'Kelas'}
                      </span>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col gap-4">
                      {dayClasses.length === 0 ? (
                        <div className="bg-white border-4 border-dashed border-black p-3 text-center my-auto">
                          <span className="text-sm font-black text-black uppercase">
                            {role === 'umum' ? 'Tidak ada kegiatan' : 'Tidak ada kelas'}
                          </span>
                        </div>
                      ) : (
                        dayClasses.map(mk => (
                          <div 
                            key={mk.id} 
                            className="bg-white border-4 border-black p-3 flex flex-col gap-2 relative group transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            style={{ borderLeftColor: mk.warna || '#000', borderLeftWidth: '8px' }}
                          >
                            {/* Card Header & Actions */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-black text-black uppercase leading-tight truncate">{mk.nama}</span>
                                {mk.is_academic && (
                                  <span className="inline-flex items-center text-[10px] font-black text-white bg-black border-2 border-black px-1.5 py-0.5 uppercase tracking-wider self-start mt-1 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                    🔒 Akademik
                                  </span>
                                )}
                              </div>
                              
                              {!mk.is_academic && (
                                <div className="flex gap-2 absolute right-2 top-2">
                                  <button 
                                    onClick={() => {
                                      setEditingMk(mk)
                                      setShowMataKuliahModal(true)
                                    }}
                                    className="p-1.5 border-2 border-black bg-yellow-300 text-black hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                    title="Edit"
                                  >
                                    <Edit2 size={12} className="stroke-2" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteMataKuliah(mk.id)}
                                    className="p-1.5 border-2 border-black bg-pink-400 text-black hover:bg-pink-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                    title="Hapus"
                                  >
                                    <Trash2 size={12} className="stroke-2" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            {mk.nama_dosen && (
                              <span className="text-xs text-black font-bold flex items-center gap-1 border-t-2 border-black pt-1 mt-1">
                                <UserRound size={12} className="stroke-2" />
                                {mk.nama_dosen}
                              </span>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-black font-black mt-2">
                              {mk.jam_mulai && mk.jam_selesai && (
                                <span className="flex items-center gap-1 bg-green-400 border-2 border-black px-1 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  <Clock size={12} className="stroke-2" />
                                  {mk.jam_mulai.substring(0, 5)} - {mk.jam_selesai.substring(0, 5)}
                                </span>
                              )}
                              {mk.ruangan && (
                                <span className="bg-white border-2 border-black px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-w-[100px] truncate" title={mk.ruangan}>
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
