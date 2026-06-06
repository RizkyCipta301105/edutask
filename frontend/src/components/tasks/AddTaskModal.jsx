import { useState } from 'react'
import { X, Flag, RefreshCw, Calendar, ChevronDown, BookOpen, Users } from 'lucide-react'
import { createPortal } from 'react-dom'
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

export default function AddTaskModal({ onClose, onCreateTask, mataKuliah = [], workspaces = [], initialDeadline = '' }) {
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [status, setStatus] = useState('todo')
  const [prioritas, setPrioritas] = useState('sedang')
  const [deadline, setDeadline] = useState(initialDeadline)
  const [mataKuliahId, setMataKuliahId] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
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
        workspace: workspaceId || null,
      })
      onClose()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) setErrors(apiErrors)
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="edutask-dashboard">
      <div className="modal-overlay !z-[9999]" onClick={onClose}>
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
            <div className="flex items-center gap-2">
              <Calendar size={14} color="#000" className="stroke-2" />
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className={`border-4 border-black font-bold px-3 py-1.5 outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 ${errors.deadline ? 'input-error' : ''}`}
              />
            </div>
          </div>
          {errors.deadline && <span className="yd-error-text" style={{ marginTop: -24, marginBottom: 16, display: 'block' }}>{errors.deadline}</span>}

          {/* Mata Kuliah */}
          {mataKuliah && mataKuliah.length > 0 && (
            <div className="mb-4">
              <div className="section-label font-black text-black"><BookOpen size={16} className="stroke-2" /> Kelas / Mata Kuliah</div>
              <select
                value={mataKuliahId}
                onChange={e => { setMataKuliahId(e.target.value); if (e.target.value) setWorkspaceId(''); }}
                className="w-full border-4 border-black bg-white p-2 font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100"
              >
                <option value="">— Tanpa kelas —</option>
                {mataKuliah.map(mk => (
                  <option key={mk.id} value={mk.id} className="font-bold">{mk.nama}</option>
                ))}
              </select>
            </div>
          )}

          {/* Workspace */}
          {workspaces && workspaces.length > 0 && (
            <div className="mb-6">
              <div className="section-label font-black text-black"><Users size={16} className="stroke-2" /> Workspace Kolaborasi</div>
              <select
                value={workspaceId}
                onChange={e => { setWorkspaceId(e.target.value); if (e.target.value) setMataKuliahId(''); }}
                className="w-full border-4 border-black bg-white p-2 font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100"
              >
                <option value="">— Tanpa workspace —</option>
                {workspaces.map(w => (
                  <option key={w.id} value={w.id} className="font-bold">{w.nama_ruang}</option>
                ))}
              </select>
            </div>
          )}

          {/* Deskripsi */}
          <div className="rich-text-editor border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white p-0">
            <div className="rich-text-toolbar border-b-4 border-black bg-[#fef08a] p-2">
              <span className="section-label font-black text-black m-0 uppercase tracking-wider">Deskripsi</span>
            </div>
            <textarea
              placeholder="Tambahkan deskripsi atau detail task..."
              value={deskripsi}
              onChange={e => setDeskripsi(e.target.value)}
              className="w-full min-h-[120px] p-4 font-bold text-black outline-none resize-y focus:bg-yellow-100"
            />
          </div>
        </div>

        <div className="modal-footer border-t-4 border-black bg-[#fbcfe8] p-4 flex justify-end gap-3">
          <button className="px-5 py-2.5 border-4 border-black bg-white font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all" onClick={onClose}>Batal</button>
          <button className="px-5 py-2.5 border-4 border-black bg-[#ea580c] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#c2410c] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50" onClick={handleCreate} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Buat Task'}
          </button>
        </div>
      </div>
    </div>
    </div>,
    document.body
  )
}
