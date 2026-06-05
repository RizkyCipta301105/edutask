import { useState, useMemo } from 'react'
import { CheckCircle2, RotateCcw, Clock, List, ArrowUpRight, Activity, X, Search } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../../services/api'

export default function Report({ 
  tasks = [], 
  tasksByStatus = { todo: [], in_progress: [], done: [] }, 
  mahasiswaList = [], 
  tugasList = [], 
  roleView = 'umum' 
}) {
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('overview')
  
  // States untuk Analitik Mahasiswa
  const [studentSearch, setStudentSearch] = useState('')
  const [studentFilter, setStudentFilter] = useState('all') // 'all', 'low', 'medium', 'done'

  // States untuk Analitik Penugasan
  const [taskSearch, setTaskSearch] = useState('')
  const [taskCourseFilter, setTaskCourseFilter] = useState('all')

  const copy = {
    dosen: { title: 'Ringkasan Pemantauan Mahasiswa', subtitle: 'Pantau progres dan rasio penyelesaian tugas seluruh mahasiswa.' },
    mahasiswa: { title: 'Ringkasan Akademik', subtitle: 'Pantau tugas kuliah, tugas kelompok, dan tenggat waktu (deadline) kamu.' },
    umum: { title: 'Ringkasan Produktivitas', subtitle: 'Pantau produktivitas dan distribusi penyelesaian task harian kamu.' }
  }[roleView] || { title: 'Ringkasan Performa', subtitle: 'Pantau produktivitas kamu.' }

  const stats = useMemo(() => {
    const getCount = (val) => Array.isArray(val) ? val.length : (typeof val === 'number' ? val : 0)
    
    const completed = getCount(tasksByStatus.done)
    const inProgress = getCount(tasksByStatus.in_progress)
    const todo = getCount(tasksByStatus.todo)
    
    // Gunakan total agregasi jika tugas kosong (khusus Dosen)
    const total = tasks.length > 0 ? tasks.length : (completed + inProgress + todo)
    const totalSafe = Math.max(total, 1)
    const incomplete = total - completed
    
    // Count overdue tasks (deadline in past and status is not done)
    const now = new Date()
    const overdue = tasks.filter(t => {
      if (!t.deadline || t.status === 'done' || t.status === 'completed') return false
      const deadlineDate = new Date(t.deadline)
      return deadlineDate < now
    }).length

    const completionRate = total > 0 ? Math.round((completed / totalSafe) * 100) : 0

    return { completed, incomplete, overdue, total, completionRate, inProgress, todo }
  }, [tasks, tasksByStatus])

  const chartData = [
    { label: 'Done', value: stats.completed, color: '#10b981', bg: '#ecfdf5' },
    { label: 'In Progress', value: stats.inProgress, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'To Do', value: stats.todo, color: '#f59e0b', bg: '#fffbeb' },
  ]

  const maxVal = Math.max(...chartData.map(d => d.value), 1)

  // ─── Filter & Search Logik untuk Dosen ─────────────────────────────────────
  const filteredStudents = useMemo(() => {
    return mahasiswaList.filter(m => {
      const q = studentSearch.toLowerCase().trim()
      const matchSearch = q ? (m.nama?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)) : true
      
      let matchFilter = true
      if (studentFilter === 'low') matchFilter = m.completion_rate < 50
      else if (studentFilter === 'medium') matchFilter = m.completion_rate >= 50 && m.completion_rate < 100
      else if (studentFilter === 'done') matchFilter = m.completion_rate === 100
      
      return matchSearch && matchFilter
    })
  }, [mahasiswaList, studentSearch, studentFilter])

  const uniqueCourses = useMemo(() => {
    const list = new Set()
    tugasList.forEach(t => {
      if (t.mata_kuliah) list.add(t.mata_kuliah)
    })
    return Array.from(list)
  }, [tugasList])

  const filteredTasks = useMemo(() => {
    return tugasList.filter(t => {
      const q = taskSearch.toLowerCase().trim()
      const matchSearch = q ? (t.judul?.toLowerCase().includes(q) || t.mata_kuliah?.toLowerCase().includes(q)) : true
      const matchCourse = taskCourseFilter === 'all' ? true : t.mata_kuliah === taskCourseFilter
      return matchSearch && matchCourse
    })
  }, [tugasList, taskSearch, taskCourseFilter])

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/api/tasks/penugasan/export/', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Laporan_Penugasan.csv')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      console.error('Failed to export CSV', err)
      alert('Gagal mengunduh CSV. Pastikan Anda memiliki akses.')
    }
  }

  return (
    <div className="report-container">
      <div className="report-section-header flex items-center justify-between">
        <div>
          <h2 className="report-title">{copy.title}</h2>
          <p className="report-subtitle">{copy.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {roleView === 'dosen' && (
            <button 
              onClick={handleExportCSV}
              className="border-4 border-black bg-[#B8842A] px-4 py-2 text-sm font-black text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#8b6914] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Unduh CSV
            </button>
          )}
          <div className="report-time-filter">
            <span>Semua Waktu</span>
            <Activity size={16} />
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigasi khusus Dosen */}
      {roleView === 'dosen' && (
        <div className="flex border-b-4 border-black mb-6 gap-6 text-sm">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`pb-3 font-black uppercase transition relative ${activeSubTab === 'overview' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Ringkasan
            {activeSubTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('mahasiswa')}
            className={`pb-3 font-black uppercase transition relative ${activeSubTab === 'mahasiswa' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Analitik Mahasiswa
            {activeSubTab === 'mahasiswa' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('tugas')}
            className={`pb-3 font-black uppercase transition relative ${activeSubTab === 'tugas' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Analitik Penugasan
            {activeSubTab === 'tugas' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-black" />
            )}
          </button>
        </div>
      )}

      {/* ─── TAB 1: OVERVIEW (RINGKASAN) ───────────────────────────────────────── */}
      {(roleView !== 'dosen' || activeSubTab === 'overview') && (
        <>
          <div className="report-stats-grid">
            <div className="report-stat-card primary">
              <div className="stat-card-inner">
                <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div className="stat-trend positive">
                  <ArrowUpRight size={14} /> {stats.completionRate}%
                </div>
              </div>
              <div className="stat-info">
                <span className="stat-label">Task Selesai</span>
                <h3 className="stat-value">{stats.completed}</h3>
                <div className="stat-progress-bar">
                  <div className="stat-progress-fill" style={{ width: `${stats.completionRate}%`, background: '#10b981' }} />
                </div>
                <span className="stat-footer">{stats.completionRate}% dari total task</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  <RotateCcw size={20} />
                </div>
              </div>
              <div className="stat-info">
                <span className="stat-label">Task Belum Selesai</span>
                <h3 className="stat-value">{stats.incomplete}</h3>
                <p className="stat-desc">{stats.inProgress} in progress · {stats.todo} to do</p>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-info">
                <span className="stat-label">Task Terlambat</span>
                <h3 className="stat-value">{stats.overdue}</h3>
                <p className="stat-desc">Perlu tindakan segera</p>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon-wrapper" style={{ background: '#f3f4f6', color: '#374151' }}>
                  <List size={20} />
                </div>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Task</span>
                <h3 className="stat-value">{stats.total}</h3>
                <p className="stat-desc">Seluruh task aktif</p>
              </div>
            </div>
          </div>

          <div className="report-main-grid">
            <div className="report-chart-card">
              <div className="card-header">
                <h4>Distribusi Task</h4>
                <div className="legend-pills">
                  {chartData.map(d => (
                    <div key={d.label} className="legend-pill">
                      <span className="dot" style={{ background: d.color }} />
                      {d.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modern-chart-area">
                {chartData.map(d => (
                  <div key={d.label} className="chart-bar-column">
                    <div className="bar-wrapper">
                      <div className="bar-value-tooltip">{d.value}</div>
                      <div
                        className="bar-fill"
                        style={{
                          height: `${(d.value / maxVal) * 100}%`,
                          background: d.color,
                          boxShadow: `0 4px 12px ${d.color}40`,
                          minHeight: d.value > 0 ? '8px' : '0',
                        }}
                      />
                    </div>
                    <span className="bar-label">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-details-card">
              <h4>Kesehatan Proyek</h4>
              <div className="health-metrics">
                <div className="health-item">
                  <div className="health-info">
                    <span>Penyelesaian Keseluruhan</span>
                    <span>{stats.completionRate}%</span>
                  </div>
                  <div className="health-bar">
                    <div className="health-fill" style={{ width: `${stats.completionRate}%`, background: '#10b981' }} />
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-info">
                    <span>Task Tepat Waktu</span>
                    <span>{stats.total > 0 ? Math.round(((stats.total - stats.overdue) / stats.total) * 100) : 100}%</span>
                  </div>
                  <div className="health-bar">
                    <div className="health-fill" style={{ width: `${stats.total > 0 ? Math.round(((stats.total - stats.overdue) / stats.total) * 100) : 100}%`, background: '#3b82f6' }} />
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-info">
                    <span>Efisiensi Task</span>
                    <span>{stats.total > 0 ? Math.round(((stats.completed + stats.inProgress) / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="health-bar">
                    <div className="health-fill" style={{ width: `${stats.total > 0 ? Math.round(((stats.completed + stats.inProgress) / stats.total) * 100) : 0}%`, background: '#8b5cf6' }} />
                  </div>
                </div>
              </div>
              <button className="view-full-report-btn" onClick={() => setShowDetailModal(true)}>Lihat Detail Lengkap</button>
            </div>
          </div>
        </>
      )}

      {/* ─── TAB 2: ANALITIK MAHASISWA INDIVIDU (KHUSUS DOSEN) ────────────────── */}
      {roleView === 'dosen' && activeSubTab === 'mahasiswa' && (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all duration-300">
          <div className="p-6 border-b-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fbcfe8]">
            <div>
              <h3 className="text-xl font-black uppercase text-black">Daftar Progress Mahasiswa</h3>
              <p className="text-sm font-bold text-black mt-1">Total {filteredStudents.length} mahasiswa tersaring</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-64 border-4 border-black bg-white py-2 pl-9 pr-4 text-sm font-bold placeholder-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-black stroke-[3]" />
              </div>
              {/* Filter Dropdown */}
              <select
                value={studentFilter}
                onChange={e => setStudentFilter(e.target.value)}
                className="border-4 border-black bg-white py-2 px-3 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors"
              >
                <option value="all">Semua Progres</option>
                <option value="low">Kurang Aktif (&lt; 50%)</option>
                <option value="medium">Cukup Aktif (50% - 99%)</option>
                <option value="done">Tuntas (100%)</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Mahasiswa</th>
                  <th className="py-4 px-6 text-center">To Do</th>
                  <th className="py-4 px-6 text-center">In Progress</th>
                  <th className="py-4 px-6 text-center">Done</th>
                  <th className="py-4 px-6 text-center font-bold">Total</th>
                  <th className="py-4 px-6 min-w-[200px]">Tingkat Penyelesaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-medium bg-slate-50/20">
                      Tidak ada data mahasiswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(m => {
                    let barColor = '#ef4444' // red
                    if (m.completion_rate >= 100) barColor = '#10b981' // green
                    else if (m.completion_rate >= 50) barColor = '#f59e0b' // yellow
                    
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800">{m.nama || 'Mahasiswa'}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{m.email}</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fffbeb] text-[#d97706]">{m.todo}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#eff6ff] text-[#2563eb]">{m.in_progress}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#059669]">{m.done}</span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-800">{m.total}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="rounded-full h-full transition-all duration-500" style={{ width: `${m.completion_rate}%`, backgroundColor: barColor }} />
                            </div>
                            <span className="text-xs font-bold text-slate-600 w-8 text-right">{m.completion_rate}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ANALITIK PENUGASAN KELAS (KHUSUS DOSEN) ───────────────────── */}
      {roleView === 'dosen' && activeSubTab === 'tugas' && (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all duration-300">
          <div className="p-6 border-b-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fef08a]">
            <div>
              <h3 className="text-xl font-black uppercase text-black">Daftar Progress Penugasan Kelas</h3>
              <p className="text-sm font-bold text-black mt-1">Total {filteredTasks.length} tugas tersaring</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari judul tugas..."
                  value={taskSearch}
                  onChange={e => setTaskSearch(e.target.value)}
                  className="w-64 border-4 border-black bg-white py-2 pl-9 pr-4 text-sm font-bold placeholder-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-black stroke-[3]" />
              </div>
              {/* Course Filter */}
              <select
                value={taskCourseFilter}
                onChange={e => setTaskCourseFilter(e.target.value)}
                className="border-4 border-black bg-white py-2 px-3 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors"
              >
                <option value="all">Semua Mata Kuliah</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Judul Tugas</th>
                  <th className="py-4 px-6">Mata Kuliah</th>
                  <th className="py-4 px-6 text-center">To Do</th>
                  <th className="py-4 px-6 text-center">In Progress</th>
                  <th className="py-4 px-6 text-center">Done</th>
                  <th className="py-4 px-6 text-center">Target</th>
                  <th className="py-4 px-6 min-w-[200px]">Rasio Penyelesaian Kelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-medium bg-slate-50/20">
                      Tidak ada data penugasan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(t => {
                    let barColor = '#ef4444' // red
                    if (t.completion_rate >= 100) barColor = '#10b981' // green
                    else if (t.completion_rate >= 50) barColor = '#f59e0b' // yellow
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800">{t.judul}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">{t.mata_kuliah}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fffbeb] text-[#d97706]">{t.todo}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#eff6ff] text-[#2563eb]">{t.in_progress}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#059669]">{t.done}</span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-800">{t.total}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="rounded-full h-full transition-all duration-500" style={{ width: `${t.completion_rate}%`, backgroundColor: barColor }} />
                            </div>
                            <span className="text-xs font-bold text-slate-600 w-8 text-right">{t.completion_rate}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL DETAIL LAPORAN ────────────────────────────────────────────── */}
      {showDetailModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-[600px] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-black">
              <h2 className="text-2xl font-black uppercase tracking-wider text-black">Detail Laporan</h2>
              <button onClick={() => setShowDetailModal(false)} className="hover:rotate-90 transition-transform"><X size={28} className="stroke-[3]" /></button>
            </div>
            
            <div className="modal-body">
              {roleView === 'dosen' ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div style={{ height: 300, background: '#f9fafb', borderRadius: 12, padding: 16 }}>
                      <h4 style={{ textAlign: 'center', marginBottom: 16, color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Rasio Penyelesaian Tugas</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Tuntas', value: stats.completed, color: '#10b981' },
                              { name: 'Sisa Tugas', value: stats.incomplete, color: '#f43f5e' }
                            ]}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {
                              [
                                { name: 'Tuntas', value: stats.completed, color: '#10b981' },
                                { name: 'Sisa Tugas', value: stats.incomplete, color: '#f43f5e' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))
                            }
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem', color: '#4b5563', paddingTop: 16 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ height: 300, background: '#f9fafb', borderRadius: 12, padding: 16 }}>
                      <h4 style={{ textAlign: 'center', marginBottom: 16, color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Distribusi Status Tugas</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {
                              chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ marginTop: 24, padding: 16, background: '#ecfdf5', borderRadius: 8, color: '#065f46', fontSize: '0.85rem' }}>
                    <strong>Catatan:</strong> Data di atas merekapitulasi progres seluruh kelas secara global. Anda dapat melihat detail analitik per individu mahasiswa dan per penugasan langsung di tab utama Laporan.
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#6b7280', marginBottom: 16 }}>Distribusi Status Tugas Anda:</p>
                  <div style={{ height: 220, marginBottom: 24, background: '#f9fafb', borderRadius: 12, padding: 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="label" type="category" fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <RechartsTooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                          {
                            chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <p style={{ color: '#6b7280', marginBottom: 16 }}>Daftar tugas Anda yang belum selesai atau terlambat:</p>
                  {tasks.filter(t => t.status !== 'done' && t.status !== 'completed').length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#10b981', background: '#ecfdf5', borderRadius: 8 }}>
                      <CheckCircle2 size={48} style={{ margin: '0 auto 16px' }} opacity={0.5} />
                      <p style={{ fontWeight: 600 }}>Semua tugas telah diselesaikan!</p>
                      <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Kerja bagus. Nikmati waktu istirahat Anda.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {tasks.filter(t => t.status !== 'done' && t.status !== 'completed').map(t => {
                        const isOverdue = t.deadline && new Date(t.deadline) < new Date()
                        return (
                          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: isOverdue ? '#fef2f2' : 'white' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>{t.judul}</div>
                              <div style={{ fontSize: '0.8rem', color: isOverdue ? '#ef4444' : '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> {t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tanpa tenggat waktu'}
                                {isOverdue && <span style={{ fontWeight: 600, marginLeft: 4 }}>(Terlambat)</span>}
                              </div>
                            </div>
                            <div style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: t.status === 'in_progress' ? '#eff6ff' : '#3b82f6', color: t.status === 'in_progress' ? '#3b82f6' : 'white', textTransform: 'capitalize' }}>
                              {t.status.replace('_', ' ')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailModal(false)} className="btn-primary">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
