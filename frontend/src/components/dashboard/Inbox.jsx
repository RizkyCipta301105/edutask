import { useState, useRef, useEffect } from 'react'
import { Search, Edit3, Plus, Paperclip, Smile, X, Check, Image as ImageIcon, FileText, MoreVertical, Trash, Edit2 } from 'lucide-react'
import inboxService from '../../services/inboxService'
import toast from 'react-hot-toast'

export default function Inbox({ user }) {
  const [contacts, setContacts] = useState([])
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [messages, setMessages] = useState([])
  
  const [msgInput, setMsgInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editInput, setEditInput] = useState('')
  const [activeMessageMenu, setActiveMessageMenu] = useState(null)
  const [activeReactMenu, setActiveReactMenu] = useState(null)
  
  const [showNewChat, setShowNewChat] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState([])
  
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const emojis = ['😊', '👍', '🔥', '✅', '🚀', '🙌', '✨', '💡', '🎉', '🙏']

  // Initial Fetch & Polling for Threads
  useEffect(() => {
    fetchContacts()
    fetchThreads()
    const interval = setInterval(fetchThreads, 10000)
    return () => clearInterval(interval)
  }, [])

  // Fetch Messages when Thread selected & Polling
  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId)
      inboxService.markAsRead(activeThreadId).then(fetchThreads).catch(console.error)
      const interval = setInterval(() => {
        fetchMessages(activeThreadId, true)
      }, 5000)
      return () => clearInterval(interval)
    } else {
      setMessages([])
    }
  }, [activeThreadId])

  const fetchContacts = async () => {
    try {
      const data = await inboxService.getContacts()
      setContacts(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchThreads = async () => {
    try {
      const data = await inboxService.getThreads()
      setThreads(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMessages = async (threadId, isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const data = await inboxService.getMessages(threadId)
      setMessages(data)
    } catch (err) {
      console.error(err)
    } finally {
      if (!isSilent) setLoading(false)
      scrollToBottom()
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSend = async () => {
    if (!msgInput.trim() && !pendingFile) return
    const text = msgInput.trim()
    const fileToSend = pendingFile
    setMsgInput('')
    setShowEmoji(false)
    setPendingFile(null)
    
    // Optimistic UI update (only for text)
    if (!fileToSend) {
      const tempMsg = {
        id: 'temp-' + Date.now(),
        sender: user.id,
        sender_detail: { nama_lengkap: user.nama_lengkap },
        text: text,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, tempMsg])
      scrollToBottom()
    }

    try {
      let payload
      if (fileToSend) {
        payload = new FormData()
        payload.append('attachment', fileToSend)
        if (text) payload.append('text', text)
      } else {
        payload = { text }
      }

      const toastId = fileToSend ? toast.loading('Mengirim pesan...') : null
      await inboxService.sendMessage(activeThreadId, payload)
      if (toastId) toast.success('Terkirim!', { id: toastId })
      fetchMessages(activeThreadId, true)
      fetchThreads()
    } catch (err) {
      toast.error('Gagal mengirim pesan')
      fetchMessages(activeThreadId, true) // revert
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPendingFile(file)
    }
    e.target.value = null
  }

  const handleEditInit = (msg) => {
    setEditingMessageId(msg.id)
    setEditInput(msg.text)
    setActiveMessageMenu(null)
  }

  const handleEditSave = async (msgId) => {
    if (!editInput.trim()) return
    try {
      await inboxService.editMessage(activeThreadId, msgId, editInput.trim())
      setEditingMessageId(null)
      fetchMessages(activeThreadId, true)
    } catch (err) {
      toast.error('Gagal mengedit pesan')
    }
  }

  const handleDelete = async (msgId) => {
    if (!window.confirm('Hapus pesan ini?')) return
    try {
      await inboxService.deleteMessage(activeThreadId, msgId)
      setActiveMessageMenu(null)
      fetchMessages(activeThreadId, true)
      fetchThreads()
    } catch (err) {
      toast.error('Gagal menghapus pesan')
    }
  }

  const handleReact = async (msgId, emoji) => {
    try {
      await inboxService.reactToMessage(activeThreadId, msgId, emoji)
      setActiveReactMenu(null)
      fetchMessages(activeThreadId, true)
    } catch (err) {
      toast.error('Gagal memberi reaksi')
    }
  }

  const handleCreateThread = async () => {
    if (selectedContacts.length === 0) return
    try {
      const newThread = await inboxService.createThread(selectedContacts.map(c => c.id))
      setThreads(prev => {
        const exists = prev.find(t => t.id === newThread.id)
        if (!exists) return [newThread, ...prev]
        return prev
      })
      setActiveThreadId(newThread.id)
      setShowNewChat(false)
      setSelectedContacts([])
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal membuat percakapan')
    }
  }

  const toggleContactSelection = (contact) => {
    setSelectedContacts(prev => 
      prev.find(c => c.id === contact.id) 
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    )
  }

  const currentThread = threads.find(t => t.id === activeThreadId)
  
  const getThreadName = (thread) => {
    if (thread.title) return thread.title
    const others = thread.participants.filter(p => p.id !== user?.id)
    if (others.length === 0) return 'Hanya Anda'
    if (others.length === 1) return others[0].nama_lengkap
    return others.map(o => o.nama_lengkap).join(', ')
  }

  const filteredThreads = searchQuery.trim()
    ? threads.filter(t => getThreadName(t).toLowerCase().includes(searchQuery.toLowerCase()))
    : threads

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2)
  }

  return (
    <div className="inbox-layout">
      {/* SIDEBAR */}
      <div className="inbox-sidebar">
        <div className="inbox-search">
          <div className="inbox-search-input">
            <Search size={16} color="#9ca3af" />
            <input type="text" placeholder="Cari pesan" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className="inbox-edit-btn" title="Pesan baru" onClick={() => setShowNewChat(true)}>
            <Edit3 size={18} />
          </button>
        </div>

        <div className="inbox-list">
          {filteredThreads.map(t => (
            <div key={t.id} className={`inbox-item ${t.id === activeThreadId ? 'active' : ''}`} onClick={() => { setActiveThreadId(t.id); setShowNewChat(false); }}>
              <div className="inbox-item-icon">
                <div className="small-avatar-inbox" style={{ background: t.is_group ? '#3b82f6' : '#6b7280' }}>
                  {getInitials(getThreadName(t))}
                </div>
              </div>
              <div className="inbox-item-content">
                <div className="inbox-item-header">
                  <span className="inbox-item-title" style={{ fontWeight: t.unread_count > 0 ? 700 : 500 }}>{getThreadName(t)}</span>
                </div>
                <div className="inbox-item-text" style={{ fontWeight: t.unread_count > 0 ? 600 : 400, color: t.unread_count > 0 ? '#111827' : '#6b7280' }}>
                  {t.last_message ? (
                    t.last_message.attachment ? '📎 Lampiran' : t.last_message.text
                  ) : 'Belum ada pesan'}
                </div>
                {t.last_message && (
                  <div className="inbox-item-time">
                    {new Date(t.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              {t.unread_count > 0 && <div className="unread-dot" />}
            </div>
          ))}
          {filteredThreads.length === 0 && !showNewChat && (
             <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
               Belum ada percakapan.
             </div>
          )}
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="inbox-main">
        {showNewChat ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827' }}>Pesan Baru</h2>
              <button onClick={() => { setShowNewChat(false); setSelectedContacts([]) }} className="btn-outline" style={{ padding: '4px 8px', border: 'none' }}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: 16, fontSize: '0.9rem', color: '#6b7280' }}>Pilih orang untuk diajak mengobrol:</div>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              {contacts.map(c => (
                <div key={c.id} onClick={() => toggleContactSelection(c)} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selectedContacts.find(x => x.id === c.id) ? '#eff6ff' : 'white' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6b7280', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, marginRight: 12 }}>
                    {getInitials(c.nama_lengkap)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{c.nama_lengkap}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'capitalize' }}>{c.role}</div>
                  </div>
                  {selectedContacts.find(x => x.id === c.id) && <Check size={20} color="#3b82f6" />}
                </div>
              ))}
              {contacts.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Tidak ada kontak yang tersedia untuk Role Anda.</div>
              )}
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleCreateThread} className="btn-primary" disabled={selectedContacts.length === 0}>
                Mulai Percakapan {selectedContacts.length > 1 ? `(${selectedContacts.length})` : ''}
              </button>
            </div>
          </div>
        ) : activeThreadId && currentThread ? (
          <>
            <div className="inbox-main-header">
              <span className="collab-label" style={{ fontWeight: 600, color: '#111827' }}>{getThreadName(currentThread)}</span>
              <div className="collaborators">
                {currentThread.participants.filter(p => p.id !== user?.id).map((p) => (
                  <div key={p.id} title={p.nama_lengkap} className="small-avatar-collab" style={{ background: '#3b82f6' }}>{getInitials(p.nama_lengkap)}</div>
                ))}
              </div>
            </div>

            <div className="inbox-thread" style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f9fafb' }}>
              <div className="thread-content-wrapper">
                <div className="chat-messages-list">
                  {messages.map((msg) => {
                    const isMe = msg.sender === user?.id
                    return (
                      <div key={msg.id} className="msg-container" style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: msg.reactions && Object.keys(msg.reactions).length > 0 ? 24 : 16 }} onMouseLeave={() => { setActiveMessageMenu(null); setActiveReactMenu(null); }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', position: 'relative' }}>
                          <div className="chat-avatar" style={{ background: isMe ? '#6b7280' : '#8b5cf6', width: 28, height: 28, fontSize: '0.7rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'white' }}>
                            {getInitials(msg.sender_detail?.nama_lengkap)}
                          </div>
                          
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                            <div style={{
                              background: isMe ? '#111827' : 'white',
                              color: isMe ? 'white' : '#111827',
                              padding: '10px 14px',
                              borderRadius: '16px',
                              borderBottomRightRadius: isMe ? 4 : 16,
                              borderBottomLeftRadius: !isMe ? 4 : 16,
                              maxWidth: '100%',
                              fontSize: '0.95rem',
                              border: isMe ? 'none' : '1px solid #e5e7eb',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              position: 'relative'
                            }}>
                              {msg.attachment && (
                                <div style={{ marginBottom: msg.text || editingMessageId === msg.id ? 8 : 0 }}>
                                  <a href={msg.attachment.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${msg.attachment}` : msg.attachment} target="_blank" rel="noreferrer" style={{ color: isMe ? '#60a5fa' : '#3b82f6', textDecoration: 'underline' }}>
                                    📎 Unduh Lampiran
                                  </a>
                                </div>
                              )}
                              
                              {editingMessageId === msg.id ? (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                   <textarea 
                                     value={editInput} 
                                     onChange={e => setEditInput(e.target.value)} 
                                     onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(msg.id) } }} 
                                     style={{ 
                                       color: isMe ? 'white' : '#111827', 
                                       background: isMe ? 'rgba(255,255,255,0.1)' : '#f9fafb',
                                       padding: '8px 12px', 
                                       borderRadius: 8, 
                                       border: isMe ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e5e7eb', 
                                       outline: 'none', 
                                       width: '100%', 
                                       minWidth: 200,
                                       fontFamily: 'inherit',
                                       fontSize: '0.9rem',
                                       resize: 'vertical',
                                       minHeight: 40
                                     }} 
                                     autoFocus 
                                   />
                                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                     <button onClick={() => setEditingMessageId(null)} style={{ background: 'transparent', color: isMe ? 'rgba(255,255,255,0.7)' : '#6b7280', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '4px 8px' }}>Batal</button>
                                     <button onClick={() => handleEditSave(msg.id)} style={{ background: isMe ? 'white' : '#111827', color: isMe ? '#111827' : 'white', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 600 }}>Simpan</button>
                                   </div>
                                 </div>
                              ) : (
                                 <div style={{ wordBreak: 'break-word' }}>
                                   {msg.text}
                                   {msg.is_edited && <span style={{ fontSize: '0.65rem', color: isMe ? '#d1d5db' : '#9ca3af', marginLeft: 6, fontStyle: 'italic' }}>(diedit)</span>}
                                 </div>
                              )}

                              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                <div style={{ display: 'flex', gap: 4, position: 'absolute', bottom: -12, [isMe ? 'right' : 'left']: 16, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '2px 6px', zIndex: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                  {Object.entries(msg.reactions).map(([emoji, users]) => (
                                    <div key={emoji} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#111827' }} onClick={() => handleReact(msg.id, emoji)} title={users.length + " reaksi"}>
                                      <span>{emoji}</span>
                                      {users.length > 1 && <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{users.length}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="msg-actions" style={{ display: 'flex', opacity: (activeMessageMenu === msg.id || activeReactMenu === msg.id) ? 1 : 0, gap: 4, transition: 'opacity 0.2s', alignItems: 'center' }}>
                              <div style={{ position: 'relative' }}>
                                <button className="chat-icon-btn small" onClick={() => { setActiveReactMenu(activeReactMenu === msg.id ? null : msg.id); setActiveMessageMenu(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', borderRadius: '50%' }}>
                                  <Smile size={16} />
                                </button>
                                {activeReactMenu === msg.id && (
                                  <div style={{ position: 'absolute', bottom: 35, [isMe ? 'right' : 'left']: 0, background: 'white', border: '1px solid #e5e7eb', padding: '8px', borderRadius: 24, display: 'flex', gap: 6, zIndex: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                    {emojis.slice(0,6).map(e => (
                                      <span key={e} style={{ cursor: 'pointer', fontSize: '1.4rem', padding: '4px', borderRadius: '50%', transition: 'transform 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleReact(msg.id, e)} onMouseEnter={ev => ev.target.style.transform = 'scale(1.2)'} onMouseLeave={ev => ev.target.style.transform = 'scale(1)'}>
                                        {e}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {isMe && (
                                <div style={{ position: 'relative' }}>
                                  <button className="chat-icon-btn small" onClick={() => { setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id); setActiveReactMenu(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', borderRadius: '50%' }}>
                                    <MoreVertical size={16} />
                                  </button>
                                  {activeMessageMenu === msg.id && (
                                    <div style={{ position: 'absolute', bottom: 30, right: 0, background: 'white', border: '1px solid #e5e7eb', padding: '4px 0', borderRadius: 8, zIndex: 10, minWidth: 100, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                      <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#111827' }} onClick={() => handleEditInit(msg)} onMouseEnter={e => e.target.style.background = '#f3f4f6'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                        <Edit2 size={14} /> Edit
                                      </div>
                                      <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }} onClick={() => handleDelete(msg.id)} onMouseEnter={e => e.target.style.background = '#fef2f2'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                        <Trash size={14} /> Hapus
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4, padding: isMe ? '0 40px 0 0' : '0 0 0 40px' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            <div className="chat-input-area" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px', background: 'white', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingFile && (
                <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '12px 16px', borderRadius: 8, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: '#e5e7eb', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {pendingFile.type.startsWith('image/') ? <ImageIcon size={24} color="#6b7280" /> : <FileText size={24} color="#6b7280" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{pendingFile.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{(pendingFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button onClick={() => setPendingFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
                    <X size={20} />
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                <button className="chat-icon-btn" title="Lampirkan File" onClick={() => fileInputRef.current.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  <Paperclip size={20} />
                </button>
                
                <div className="chat-input-box" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e5e7eb', borderRadius: 24, padding: '0 16px' }}>
                  <input 
                    type="text" 
                    placeholder={pendingFile ? "Tambahkan keterangan (opsional)..." : "Ketik pesan..."} 
                    value={msgInput} 
                    onChange={e => setMsgInput(e.target.value)} 
                    onKeyDown={(e) => { if(e.key === 'Enter') handleSend() }} 
                    style={{ flex: 1, padding: '12px 0', border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent' }}
                  />
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                    <Smile size={20} color={showEmoji ? '#3b82f6' : '#9ca3af'} style={{ cursor: 'pointer' }} onClick={() => setShowEmoji(!showEmoji)} />
                    {showEmoji && (
                      <div className="emoji-picker-simple" style={{ position: 'absolute', bottom: 40, right: 0, background: 'white', border: '1px solid #e5e7eb', padding: 8, borderRadius: 8, display: 'flex', gap: 8, zIndex: 10 }}>
                        {emojis.map(e => <span key={e} style={{ cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => { setMsgInput(p => p + e); setShowEmoji(false) }}>{e}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                <button className="chat-send-btn" onClick={handleSend} disabled={!msgInput.trim() && !pendingFile} style={{ background: (msgInput.trim() || pendingFile) ? '#111827' : '#e5e7eb', color: (msgInput.trim() || pendingFile) ? 'white' : '#9ca3af', padding: '8px 16px', borderRadius: 20, border: 'none', fontWeight: 600, cursor: (msgInput.trim() || pendingFile) ? 'pointer' : 'not-allowed' }}>
                  Kirim
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Pilih percakapan untuk mulai mengirim pesan</div>
        )}
      </div>
    </div>
  )
}
