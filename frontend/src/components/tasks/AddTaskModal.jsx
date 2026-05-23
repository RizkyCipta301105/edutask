import { useState } from 'react'
import { X, Flag, RefreshCw, Calendar, ChevronDown, BookOpen } from 'lucide-react'
import './Modals.css'

const STATUSES = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
]
const PRIORITIES = [
  { value: 'tinggi', label: 'Tinggi', color: '#dc2626' },
  { value: 'sedang', label: 'Sedang', color: '#d97706' },
  { value: 'rendah', label: 'Rendah', color: '#16a34a' },
]

export default function AddTaskModal({ onClose, onCreateTask, mataKuliah = [], initialDeadline = '' }) {
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [status, setStatus] = useState('todo')
  const [prioritas, setPrioritas] = useState('sedang')
  const [deadline, setDeadline] = useState(initialDeadline)
  const [mataKuliahId, setMataKuliahId] = useState('')
  const [showStatusDrop, setShowStatusDrop] = useState(false)
  const [showPriorityDrop, setShowPriorityDrop] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const currentPriority = PRIORITIES.find(p => p.value === prioritas) || PRIORITIES[1]
  const currentStatus = STATUSES.find(s => s.value === status) || STATUSES[0]

  const handleCreate = async () => {
    const errs = {}
    if (!judul.trim()) errs.judul = 'Judul task wajib diisi'
    if (!deadline) errs.deadline = 'Deadline wajib diisi'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await onCreateTask({
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        status,
        prioritas,
        deadline,
        mata_kuliah: mataKuliahId || null,
      })
      onClose()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) setErrors(apiErrors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span>Task Baru</span>
          <div className="modal-header-actions"><X size={20} onClick={onClose} style={{ cursor: 'pointer' }} /></div>
        </div>

        <div className="modal-body">
          <input
            type="text"
            className={`add-task-title-input ${errors.judul ? 'input-error' : ''}`}
            placeholder="Masukkan judul task..."
            value={judul}
            onChange={e => setJudul(e.target.value)}
            autoFocus
          />
          {errors.judul && <span className="yd-error-text" style={{ marginTop: -16, marginBottom: 16, display: 'block' }}>{errors.judul}</span>}

          <div className="add-task-toolbar">
            {/* Priority Dropdown */}
            <div style={{ position: 'relative' }}>
              <button className="toolbar-btn" onClick={() => { setShowPriorityDrop(!showPriorityDrop); setShowStatusDrop(false); }}>
                <Flag size={14} color={currentPriority.color} /> {currentPriority.label} <ChevronDown size={14} />
              </button>
              {showPriorityDrop && (
                <div className="dropdown-menu">
                  {PRIORITIES.map(p => (
                    <div key={p.value} className={`dropdown-item ${prioritas === p.value ? 'active' : ''}`}
                      onClick={() => { setPrioritas(p.value); setShowPriorityDrop(false); }}>
                      <Flag size={12} color={p.color} /> {p.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div style={{ position: 'relative' }}>
              <button className="toolbar-btn" onClick={() => { setShowStatusDrop(!showStatusDrop); setShowPriorityDrop(false); }}>
                <RefreshCw size={14} /> {currentStatus.label} <ChevronDown size={14} />
              </button>
              {showStatusDrop && (
                <div className="dropdown-menu">
                  {STATUSES.map(s => (
                    <div key={s.value} className={`dropdown-item ${status === s.value ? 'active' : ''}`}
                      onClick={() => { setStatus(s.value); setShowStatusDrop(false); }}>
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deadline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} color="#6b7280" />
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className={errors.deadline ? 'input-error' : ''}
                style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 12px', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>
          {errors.deadline && <span className="yd-error-text" style={{ marginTop: -24, marginBottom: 16, display: 'block' }}>{errors.deadline}</span>}

          {/* Mata Kuliah */}
          {mataKuliah && mataKuliah.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="section-label"><BookOpen size={16} /> Mata Kuliah</div>
              <select
                value={mataKuliahId}
                onChange={e => setMataKuliahId(e.target.value)}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: '0.9rem', outline: 'none', background: 'white' }}
              >
                <option value="">— Tanpa mata kuliah —</option>
                {mataKuliah.map(mk => (
                  <option key={mk.id} value={mk.id}>{mk.nama}</option>
                ))}
              </select>
            </div>
          )}

          {/* Deskripsi */}
          <div className="rich-text-editor">
            <div className="rich-text-toolbar">
              <span className="section-label" style={{ marginBottom: 0 }}>Deskripsi</span>
            </div>
            <textarea
              placeholder="Tambahkan deskripsi atau detail task..."
              value={deskripsi}
              onChange={e => setDeskripsi(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', resize: 'vertical', minHeight: 80, fontSize: '0.95rem', color: '#374151', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>Batal</button>
          <button className="btn-dark" onClick={handleCreate} disabled={loading} style={{ background: '#4b5563', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Membuat...' : 'Buat Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
