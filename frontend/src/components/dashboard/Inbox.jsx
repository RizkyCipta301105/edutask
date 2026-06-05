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
  const threadContainerRef = useRef(null)

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
      setMessages(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data)) return data;
        return prev;
      })
    } catch (err) {
      console.error(err)
    } finally {
      if (!isSilent) {
        setLoading(false)
        scrollToBottom()
      }
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (threadContainerRef.current) {
        threadContainerRef.current.scrollTo({
          top: threadContainerRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }
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
      fetchMessages(activeThreadId, false) // isSilent = false, so it scrolls to the bottom after sending
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
    <div className="flex h-[calc(100vh-140px)] w-full border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* SIDEBAR */}
      <div className="flex w-[380px] min-w-[380px] flex-col border-r-4 border-black bg-white">
        <div className="flex gap-3 border-b-4 border-black bg-[#fef08a] p-4">
          <div className="flex flex-1 items-center border-4 border-black bg-white px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors focus-within:bg-yellow-100">
            <Search size={18} className="text-black stroke-[3]" />
            <input 
              type="text" 
              placeholder="Cari pesan" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="ml-2 w-full bg-transparent font-bold text-black outline-none placeholder:text-gray-500"
            />
          </div>
          <button 
            className="flex h-[44px] w-[44px] items-center justify-center border-4 border-black bg-[#ea580c] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none" 
            title="Pesan baru" 
            onClick={() => setShowNewChat(true)}
          >
            <Edit3 size={20} className="stroke-[3]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {filteredThreads.map(t => (
            <div 
              key={t.id} 
              className={`relative flex cursor-pointer gap-4 border-b-4 border-black p-4 transition-colors ${t.id === activeThreadId ? 'bg-yellow-200' : 'hover:bg-yellow-100'}`} 
              onClick={() => { setActiveThreadId(t.id); setShowNewChat(false); }}
            >
              <div className="mt-1 flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center border-4 border-black font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ background: t.is_group ? '#3b82f6' : '#ea580c' }}>
                  {getInitials(getThreadName(t))}
                </div>
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                <div className="mb-1">
                  <span className={`block truncate text-sm uppercase ${t.unread_count > 0 ? 'font-black text-black' : 'font-bold text-gray-800'}`}>
                    {getThreadName(t)}
                  </span>
                </div>
                <div className={`text-xs truncate ${t.unread_count > 0 ? 'font-bold text-black' : 'font-semibold text-gray-600'}`}>
                  {t.last_message ? (
                    t.last_message.attachment ? '📎 Lampiran' : t.last_message.text
                  ) : 'Belum ada pesan'}
                </div>
                {t.last_message && (
                  <div className="mt-1 text-[10px] font-black text-gray-500">
                    {new Date(t.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              {t.unread_count > 0 && <div className="absolute right-4 top-4 h-3 w-3 border-2 border-black bg-red-500 rounded-full" />}
            </div>
          ))}
          {filteredThreads.length === 0 && !showNewChat && (
             <div className="p-8 text-center text-sm font-black uppercase text-gray-500">
               Belum ada percakapan.
             </div>
          )}
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex flex-1 flex-col bg-[#fbcfe8]">
        {showNewChat ? (
          <div className="flex h-full flex-col p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase text-black">Pesan Baru</h2>
              <button 
                onClick={() => { setShowNewChat(false); setSelectedContacts([]) }} 
                className="border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <X size={24} className="stroke-[3]" />
              </button>
            </div>
            
            <div className="mb-4 text-sm font-black uppercase text-black">Pilih orang untuk diajak mengobrol:</div>
            <div className="flex-1 overflow-y-auto border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {contacts.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => toggleContactSelection(c)} 
                  className={`flex cursor-pointer items-center border-b-4 border-black p-4 transition-colors ${selectedContacts.find(x => x.id === c.id) ? 'bg-yellow-200' : 'hover:bg-yellow-100'}`}
                >
                  <div className="mr-4 flex h-10 w-10 items-center justify-center border-4 border-black bg-purple-300 font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {getInitials(c.nama_lengkap)}
                  </div>
                  <div className="flex-1">
                    <div className="font-black uppercase text-black">{c.nama_lengkap}</div>
                    <div className="text-xs font-bold capitalize text-gray-700">{c.role}</div>
                  </div>
                  {selectedContacts.find(x => x.id === c.id) && <Check size={24} className="stroke-[3] text-black" />}
                </div>
              ))}
              {contacts.length === 0 && (
                <div className="p-8 text-center text-sm font-black uppercase text-gray-500">Tidak ada kontak yang tersedia untuk Role Anda.</div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleCreateThread} 
                className="border-4 border-black bg-[#ea580c] px-6 py-3 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#c2410c] hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50" 
                disabled={selectedContacts.length === 0}
              >
                Mulai Percakapan {selectedContacts.length > 1 ? `(${selectedContacts.length})` : ''}
              </button>
            </div>
          </div>
        ) : activeThreadId && currentThread ? (
          <>
            <div className="flex items-center justify-between border-b-4 border-black bg-white p-4 shadow-sm">
              <span className="text-lg font-black uppercase text-black">{getThreadName(currentThread)}</span>
              <div className="flex -space-x-2">
                {currentThread.participants.filter(p => p.id !== user?.id).map((p) => (
                  <div 
                    key={p.id} 
                    title={p.nama_lengkap} 
                    className="flex h-8 w-8 items-center justify-center border-2 border-black bg-blue-300 text-xs font-black uppercase text-black"
                  >
                    {getInitials(p.nama_lengkap)}
                  </div>
                ))}
              </div>
            </div>

            <div ref={threadContainerRef} className="inbox-thread" style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f9fafb' }}>
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

            <div className="flex flex-col gap-3 border-t-4 border-black bg-white p-4">
              {pendingFile && (
                <div className="flex items-center justify-between border-4 border-black bg-[#fef08a] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border-4 border-black bg-white">
                      {pendingFile.type.startsWith('image/') ? <ImageIcon size={20} className="stroke-[3] text-black" /> : <FileText size={20} className="stroke-[3] text-black" />}
                    </div>
                    <div>
                      <div className="font-black uppercase text-black">{pendingFile.name}</div>
                      <div className="text-xs font-bold text-gray-700">{(pendingFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button onClick={() => setPendingFile(null)} className="flex h-8 w-8 items-center justify-center border-4 border-black bg-white hover:bg-red-500 hover:text-white transition-colors">
                    <X size={16} className="stroke-[3]" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button 
                  title="Lampirkan File" 
                  onClick={() => fileInputRef.current.click()} 
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-yellow-200 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  <Paperclip size={20} className="stroke-[3] text-black" />
                </button>
                
                <div className="relative flex flex-1 items-center border-4 border-black bg-white px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:bg-yellow-100">
                  <input 
                    type="text" 
                    placeholder={pendingFile ? "Tambahkan keterangan (opsional)..." : "Ketik pesan..."} 
                    value={msgInput} 
                    onChange={e => setMsgInput(e.target.value)} 
                    onKeyDown={(e) => { if(e.key === 'Enter') handleSend() }} 
                    className="w-full bg-transparent py-3 font-bold text-black outline-none placeholder:font-bold placeholder:text-gray-500"
                  />
                  <div className="relative ml-2 flex items-center">
                    <Smile size={20} className="cursor-pointer stroke-[3] text-black hover:text-[#ea580c]" onClick={() => setShowEmoji(!showEmoji)} />
                    {showEmoji && (
                      <div className="absolute bottom-12 right-0 z-10 flex gap-2 border-4 border-black bg-white p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {emojis.map(e => (
                          <span key={e} className="cursor-pointer text-xl hover:scale-125 transition-transform" onClick={() => { setMsgInput(p => p + e); setShowEmoji(false) }}>{e}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleSend} 
                  disabled={!msgInput.trim() && !pendingFile} 
                  className="flex h-12 items-center justify-center border-4 border-black bg-[#ea580c] px-6 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#c2410c] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Kirim
                </button>
              </div>
            </div>
          </>
         ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-lg font-black uppercase text-gray-500">
            Pilih percakapan untuk mulai mengirim pesan
          </div>
        )}
      </div>
    </div>
  )
}
