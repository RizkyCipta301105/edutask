import { useState, useMemo } from 'react'
import { CheckCircle2, RotateCcw, Clock, List, ArrowUpRight, Activity, X } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Report({ tasks = [], tasksByStatus = { todo: [], in_progress: [], done: [] }, roleView = 'umum' }) {
  const [showDetailModal, setShowDetailModal] = useState(false)

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
      // Set to start of day for comparison
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

  return (
    <div className="report-container">
      <div className="report-section-header">
        <div>
          <h2 className="report-title">{copy.title}</h2>
          <p className="report-subtitle">{copy.subtitle}</p>
        </div>
        <div className="report-time-filter">
          <span>Semua Waktu</span>
          <Activity size={16} />
        </div>
      </div>

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

      {showDetailModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ background: 'white', maxWidth: 600, width: '100%', padding: '24px 32px', borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="modal-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Detail Laporan</h2>
              <button onClick={() => setShowDetailModal(false)} className="btn-outline" style={{ padding: 4, border: 'none' }}><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
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
                  <div style={{ marginTop: 24, padding: 16, background: '#eff6ff', borderRadius: 8, color: '#1e40af', fontSize: '0.85rem' }}>
                    <strong>Catatan:</strong> Saat ini sistem merekapitulasi data seluruh kelas. Fitur analitik per individu mahasiswa akan tersedia pada pembaruan mendatang.
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#6b7280', marginBottom: 16 }}>Distribusi Status Tugas Anda:</p>
                  <div style={{ height: 220, marginBottom: 24, background: '#f9fafb', borderRadius: 12, padding: 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="label" type="category" fontSize={12} tickLine={false} axisLine={false} width={80} />
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
