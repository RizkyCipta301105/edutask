import { useState } from 'react'
import { X, CheckCircle2, Share2, Flag, Calendar, BookOpen, Trash2, MessageSquare, PlusSquare, Link as LinkIcon, Paperclip } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import taskService from '../../services/taskService'
import { useEffect } from 'react'
import './Modals.css'

const STATUS_LABELS = {
  todo:        'To Do',
  in_progress: 'In Progress',
  done:        'Done',
}

const PRIORITAS_LABELS = {
  tinggi: 'Tinggi',
  sedang: 'Sedang',
  rendah: 'Rendah',
}

const PRIORITAS_COLORS = {
  tinggi: '#dc2626',
  sedang: '#d97706',
  rendah: '#16a34a',
}

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete, onAddComment }) {
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editJudul, setEditJudul] = useState(task.judul)
  const [editDeskripsi, setEditDeskripsi] = useState(task.deskripsi || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // Initials for comments
  const authorName = user?.nama_lengkap || 'Anda'
  const userInitials = user?.nama_lengkap
    ? user.nama_lengkap.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  // Persistent real comments
  const [comments, setComments] = useState([])

  useEffect(() => {
    taskService.getComments(task.id)
      .then(res => setComments(res))
      .catch(console.error)
  }, [task.id])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('attachment', file)
    try {
      await onUpdate(task.id, formData)
    } catch {
      // errors handled by parent
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editJudul.trim()) return
    setLoading(true)
    try {
      await onUpdate(task.id, { judul: editJudul.trim(), deskripsi: editDeskripsi.trim() })
      setIsEditing(false)
    } catch {
      // errors handled by parent
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`Task: ${task.judul} (ID: ${task.id})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdate(task.id, { status: newStatus })
    } catch {
      // errors handled by parent
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(task.id)
      onClose()
    } catch {
      // errors handled by parent
    } finally {
      setLoading(false)
    }
  }

  const handlePostComment = async () => {
    if (!commentText.trim()) return
    try {
      const newComment = await taskService.addComment(task.id, commentText.trim())
      setComments(prev => [...prev, newComment])
      setCommentText('')
      if (onAddComment) {
        onAddComment(task.id, commentText.trim())
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} color={task.status === 'done' ? '#16a34a' : '#9ca3af'} /> TASK-{task.id}
          </div>
          <div className="modal-header-actions">
            <span style={{ cursor: 'pointer', position: 'relative' }} onClick={handleShare}>
              <Share2 size={18} />
              {copied && <span style={{ position: 'absolute', top: '100%', right: 0, background: '#111827', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: '0.7rem', whiteSpace: 'nowrap', zIndex: 10 }}>Tersalin!</span>}
            </span>
            <Trash2 size={18} color="#dc2626" style={{ cursor: 'pointer' }} onClick={() => setShowDeleteConfirm(true)} />
            <X size={20} onClick={onClose} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div className="task-detail-container">
          <div className="task-detail-main">
            {isEditing ? (
              <>
                <input type="text" value={editJudul} onChange={e => setEditJudul(e.target.value)} className="add-task-title-input" style={{ marginBottom: 16 }} />
                <textarea value={editDeskripsi} onChange={e => setEditDeskripsi(e.target.value)} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, minHeight: 100, fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  <button className="btn-dark" onClick={handleSaveEdit} disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button className="btn-outline" onClick={() => { setIsEditing(false); setEditJudul(task.judul); setEditDeskripsi(task.deskripsi || ''); }}>Batal</button>
                </div>
              </>
            ) : (
              <>
                <h1 className="task-title-large" onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }} title="Klik untuk edit">
                  {task.judul}
                </h1>

                <div className="task-labels-row">
                  <div className="label-dark" style={{ background: PRIORITAS_COLORS[task.prioritas] || '#6b7280' }}>
                    <Flag size={14} color="white" /> {PRIORITAS_LABELS[task.prioritas] || task.prioritas}
                  </div>
                  {task.mata_kuliah_detail?.nama && (
                    <div className="label-pill">📚 {task.mata_kuliah_detail.nama}</div>
                  )}
                </div>

                <div className="meta-grid">
                  <div className="meta-item">
                    <label>DEADLINE</label>
                    <div className="meta-value">
                      <Calendar size={18} color="#6b7280" />
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Belum diatur'}
                    </div>
                  </div>
                  <div className="meta-item">
                    <label>STATUS</label>
                    <div className="meta-value">
                      <select value={task.status} onChange={e => handleStatusChange(e.target.value)}
                        style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 8px', fontSize: '0.85rem', outline: 'none', background: 'white' }}>
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="meta-item">
                    <label>PRIORITAS</label>
                    <div className="meta-value">
                      <Flag size={16} color={PRIORITAS_COLORS[task.prioritas] || '#6b7280'} />
                      {PRIORITAS_LABELS[task.prioritas] || task.prioritas}
                    </div>
                  </div>
                  {task.mata_kuliah_detail?.nama && (
                    <div className="meta-item">
                      <label>MATA KULIAH</label>
                      <div className="meta-value">
                        <BookOpen size={16} color="#6b7280" />
                        {task.mata_kuliah_detail.nama}
                      </div>
                    </div>
                  )}
                </div>

                <div className="description-section" onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', marginBottom: 12 }}>DESKRIPSI</label>
                  <p className="description-text">{task.deskripsi || 'Klik untuk menambahkan deskripsi...'}</p>
                </div>

                <div className="description-section" style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', marginBottom: 12 }}><Paperclip size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: 4}}/>LAMPIRAN BERKAS</label>
                  {task.attachment ? (
                    <div style={{ marginBottom: 8 }}>
                      <a href={task.attachment.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${task.attachment}` : task.attachment} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline', fontSize: '0.9rem' }}>
                        Unduh Lampiran
                      </a>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Belum ada lampiran.</span>
                    </div>
                  )}
                  <div>
                    <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileUpload} />
                    <label htmlFor="file-upload" className="btn-outline" style={{ display: 'inline-block', cursor: 'pointer', padding: '4px 12px', fontSize: '0.8rem', opacity: loading ? 0.5 : 1 }}>
                      {loading ? 'Mengunggah...' : 'Unggah Berkas'}
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Comments Section */}
            <div className="comments-section" style={{ marginTop: 32 }}>
              <div className="comments-header" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>
                <MessageSquare size={20} /> Komentar <span className="comment-count" style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 12, fontSize: '0.8rem' }}>{comments.length}</span>
              </div>
              
              <div className="comment-input-row" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <div className="small-avatar" style={{ background: '#374151', color: 'white', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {userInitials}
                </div>
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Tulis komentar..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handlePostComment(); }}
                    style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <button
                    className="btn-dark"
                    onClick={handlePostComment}
                    disabled={!commentText.trim()}
                    style={{ padding: '8px 16px', opacity: commentText.trim() ? 1 : 0.5 }}
                  >
                    Kirim
                  </button>
                </div>
              </div>

              <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {comments.map((comment) => {
                  const initial = comment.user_nama ? comment.user_nama.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'U';
                  return (
                    <div key={comment.id} className="comment-item" style={{ display: 'flex', gap: 12 }}>
                      <div className="small-avatar" style={{ background: '#6b7280', color: 'white', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                        {initial}
                      </div>
                      <div>
                        <div style={{ marginBottom: 2 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', marginRight: 8 }}>{comment.user_nama}</span>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(comment.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="description-text" style={{ fontSize: '0.9rem', color: '#374151' }}>{comment.komentar}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {comments.length === 0 && (
                <div style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '12px 0' }}>
                  Belum ada komentar. Jadilah yang pertama memberikan komentar!
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="task-detail-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-section-title">AKSI</div>
              <div className="sidebar-action" onClick={() => setIsEditing(true)}>
                <PlusSquare size={16} /> Edit Task
              </div>
              <div className="sidebar-action" onClick={handleShare}>
                <LinkIcon size={16} /> Salin Link
              </div>
              <div className="sidebar-action" style={{ color: '#dc2626' }} onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={16} /> Hapus Task
              </div>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-title">STATUS CEPAT</div>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <div key={val} className="sidebar-action" onClick={() => handleStatusChange(val)}
                  style={{ fontWeight: task.status === val ? 600 : 400, color: task.status === val ? '#111827' : '#374151' }}>
                  <CheckCircle2 size={16} color={task.status === val ? '#16a34a' : '#d1d5db'} /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, zIndex: 50 }}>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: 400, textAlign: 'center' }}>
              <h3 style={{ marginBottom: 8, fontWeight: 600 }}>Hapus Task?</h3>
              <p style={{ color: '#6b7280', marginBottom: 16, fontSize: '0.9rem' }}>
                Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus &quot;{task.judul}&quot;?
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn-outline" onClick={() => setShowDeleteConfirm(false)}>Batal</button>
                <button className="btn-dark" style={{ background: '#dc2626' }} onClick={handleDelete} disabled={loading}>
                  {loading ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
