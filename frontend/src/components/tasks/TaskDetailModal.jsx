import { useState } from 'react'
import { X, CheckCircle2, Share2, Flag, Calendar, BookOpen, Trash2, MessageSquare, PlusSquare, Link as LinkIcon, Paperclip } from 'lucide-react'
import { createPortal } from 'react-dom'
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

  return createPortal(
    <div className="edutask-dashboard">
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col w-full max-w-[1000px] max-h-[90vh] overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black bg-yellow-300 p-4 sm:p-5 shrink-0">
          <div className="flex items-center gap-3 font-black uppercase text-lg sm:text-xl tracking-wide">
            <CheckCircle2 size={28} className={task.status === 'done' ? 'text-green-600' : 'text-black'} strokeWidth={3} />
            <span>TASK-{task.id}</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative group hover:scale-110 transition-transform" onClick={handleShare}>
              <Share2 size={24} className="stroke-[2.5]" />
              {copied && <span className="absolute top-full right-0 mt-2 bg-black text-white px-2 py-1 text-xs font-bold border-2 border-white z-50 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">Tersalin!</span>}
            </button>
            <button className="hover:scale-110 transition-transform text-red-600" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={24} className="stroke-[2.5]" />
            </button>
            <button className="hover:scale-110 transition-transform" onClick={onClose}>
              <X size={28} className="stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-white">
          
          {/* Main Content (Left) */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 md:border-r-4 border-black">
            {isEditing ? (
              <div className="mb-8">
                <input 
                  type="text" 
                  value={editJudul} 
                  onChange={e => setEditJudul(e.target.value)} 
                  className="w-full text-3xl font-black uppercase border-4 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors" 
                  placeholder="Judul Tugas..."
                />
                <textarea 
                  value={editDeskripsi} 
                  onChange={e => setEditDeskripsi(e.target.value)} 
                  className="w-full text-lg font-bold border-4 border-black p-4 min-h-[150px] resize-y mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors" 
                  placeholder="Deskripsi Tugas..."
                />
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 border-4 border-black bg-[#ea580c] text-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50" onClick={handleSaveEdit} disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button className="px-6 py-3 border-4 border-black bg-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all" onClick={() => { setIsEditing(false); setEditJudul(task.judul); setEditDeskripsi(task.deskripsi || ''); }}>
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight break-words cursor-pointer hover:underline decoration-4 underline-offset-4" onClick={() => setIsEditing(true)} title="Klik untuk edit">
                  {task.judul}
                </h1>

                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="border-4 border-black px-4 py-2 font-black uppercase text-sm flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white" style={{ backgroundColor: PRIORITAS_COLORS[task.prioritas] || '#000' }}>
                    <Flag size={16} className="stroke-[3]" /> {PRIORITAS_LABELS[task.prioritas] || task.prioritas}
                  </div>
                  {task.mata_kuliah_detail?.nama && (
                    <div className="border-4 border-black bg-blue-300 text-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                      <BookOpen size={16} className="stroke-[3]" /> {task.mata_kuliah_detail.nama}
                    </div>
                  )}
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="border-4 border-black bg-pink-200 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">Deadline</label>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <Calendar size={20} className="stroke-[2.5]" />
                      {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Belum diatur'}
                    </div>
                  </div>
                  <div className="border-4 border-black bg-purple-200 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">Status</label>
                    <select 
                      value={task.status} 
                      onChange={e => handleStatusChange(e.target.value)}
                      className="w-full border-4 border-black bg-white px-3 py-2 font-black uppercase outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100 cursor-pointer transition-colors"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="mb-10">
                  <label className="block text-sm font-black uppercase tracking-widest mb-3 text-black">Deskripsi</label>
                  <div 
                    className="border-4 border-black bg-white p-5 min-h-[120px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-lg cursor-pointer hover:bg-yellow-50 transition-colors whitespace-pre-wrap"
                    onClick={() => setIsEditing(true)}
                  >
                    {task.deskripsi || <span className="text-gray-400 italic">Klik untuk menambahkan deskripsi...</span>}
                  </div>
                </div>

                {/* Lampiran */}
                <div className="mb-10">
                  <label className="block text-sm font-black uppercase tracking-widest mb-3 text-black flex items-center gap-2">
                    <Paperclip size={18} className="stroke-[3]" /> Lampiran Berkas
                  </label>
                  <div className="border-4 border-black bg-gray-100 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {task.attachment ? (
                      <div className="mb-4">
                        <a href={task.attachment.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${task.attachment}` : task.attachment} target="_blank" rel="noreferrer" className="inline-block bg-blue-400 text-black border-4 border-black font-black uppercase px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                          Unduh Lampiran
                        </a>
                      </div>
                    ) : (
                      <p className="font-bold text-gray-500 mb-4">Belum ada lampiran.</p>
                    )}
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                    <label htmlFor="file-upload" className={`inline-block border-4 border-black bg-white text-black font-black uppercase px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-yellow-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {loading ? 'Mengunggah...' : 'Unggah Berkas Baru'}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t-4 border-black pt-8">
              <div className="flex items-center gap-3 font-black text-2xl uppercase tracking-tight mb-8">
                <MessageSquare size={28} className="stroke-[3]" /> Komentar
                <span className="bg-black text-white text-sm px-3 py-1 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">{comments.length}</span>
              </div>
              
              <div className="flex gap-4 mb-10">
                <div className="w-12 h-12 shrink-0 bg-blue-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black text-lg">
                  {userInitials}
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Tulis komentar Anda..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handlePostComment(); }}
                    className="flex-1 border-4 border-black bg-white px-4 py-3 font-bold text-lg outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 transition-colors"
                  />
                  <button
                    className="border-4 border-black bg-[#ea580c] text-white px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none"
                    onClick={handlePostComment}
                    disabled={!commentText.trim()}
                  >
                    Kirim
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {comments.map((comment) => {
                  const initial = comment.user_nama ? comment.user_nama.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'U';
                  return (
                    <div key={comment.id} className="flex gap-4 p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="w-10 h-10 shrink-0 bg-gray-200 border-2 border-black flex items-center justify-center font-black text-sm">
                        {initial}
                      </div>
                      <div>
                        <div className="mb-2">
                          <span className="font-black text-black uppercase mr-3">{comment.user_nama}</span>
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 border-2 border-black px-2 py-0.5">
                            {new Date(comment.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="font-bold text-lg text-gray-800 break-words">{comment.komentar}</div>
                      </div>
                    </div>
                  )
                })}
                {comments.length === 0 && (
                  <div className="border-4 border-dashed border-gray-400 p-8 text-center bg-gray-50 font-bold text-gray-500 uppercase">
                    Belum ada komentar. Jadilah yang pertama!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="w-full md:w-64 lg:w-72 bg-[#f0f0f0] p-6 overflow-y-auto shrink-0 flex flex-col gap-10">
            
            <div>
              <div className="font-black text-sm uppercase tracking-widest mb-4 pb-2 border-b-4 border-black">Aksi Cepat</div>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-3 w-full border-4 border-black bg-white px-4 py-3 font-black uppercase text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all" onClick={() => setIsEditing(true)}>
                  <PlusSquare size={20} className="stroke-[2.5]" /> Edit Task
                </button>
                <button className="flex items-center gap-3 w-full border-4 border-black bg-white px-4 py-3 font-black uppercase text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all" onClick={handleShare}>
                  <LinkIcon size={20} className="stroke-[2.5]" /> Salin Link
                </button>
                <button className="flex items-center gap-3 w-full border-4 border-black bg-red-100 text-red-700 px-4 py-3 font-black uppercase text-left shadow-[4px_4px_0px_0px_rgba(dc,38,38,1)] hover:bg-red-500 hover:text-white hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={20} className="stroke-[2.5]" /> Hapus Task
                </button>
              </div>
            </div>

            <div>
              <div className="font-black text-sm uppercase tracking-widest mb-4 pb-2 border-b-4 border-black">Ubah Status</div>
              <div className="flex flex-col gap-3">
                {Object.entries(STATUS_LABELS).map(([val, label]) => {
                  const isActive = task.status === val;
                  return (
                    <button 
                      key={val} 
                      className={`flex items-center gap-3 w-full border-4 border-black px-4 py-3 font-black uppercase text-left transition-all ${
                        isActive 
                          ? 'bg-green-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]' 
                          : 'bg-white text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-green-200 hover:text-black hover:translate-y-1 hover:translate-x-1 hover:shadow-none'
                      }`}
                      onClick={() => handleStatusChange(val)}
                    >
                      <CheckCircle2 size={20} className="stroke-[3]" color={isActive ? 'black' : '#9ca3af'} /> {label}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-red-100 p-8 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-[450px] w-full text-center" onClick={e => e.stopPropagation()}>
              <Trash2 size={48} className="mx-auto mb-4 stroke-[2.5] text-red-600" />
              <h3 className="mb-4 font-black text-3xl uppercase tracking-tighter text-black">Hapus Task?</h3>
              <p className="text-black font-bold mb-8 text-lg border-4 border-black bg-white p-4">
                Tindakan ini permanen. Yakin ingin menghapus <br/><span className="text-red-600 underline decoration-4 underline-offset-4">{task.judul}</span>?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="flex-1 px-6 py-4 border-4 border-black bg-white font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-200 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all" onClick={() => setShowDeleteConfirm(false)}>Batal</button>
                <button className="flex-1 px-6 py-4 border-4 border-black bg-red-600 text-white font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50" onClick={handleDelete} disabled={loading}>
                  {loading ? '...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>,
    document.body
  )
}
