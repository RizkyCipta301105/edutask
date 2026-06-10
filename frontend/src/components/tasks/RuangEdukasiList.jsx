import React, { useState, useEffect } from 'react'
import { Plus, Users, Copy, Check, Users2, Trash2, Hash, LogIn, Search, CheckCircle2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '../../services/authService'

export default function RuangEdukasiList({ role, user, isWorkspaceMode = false }) {
  const [ruang, setRuang] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  
  const [formData, setFormData] = useState({ 
    nama_ruang: '', 
    deskripsi: '',
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    ruangan: '',
    warna: '#8B6914'
  })
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)
  
  const [showMembers, setShowMembers] = useState(false)
  const [membersData, setMembersData] = useState({ kreator: null, anggota: [] })
  const [selectedRuangName, setSelectedRuangName] = useState('')

  useEffect(() => {
    fetchRuang()
  }, [isWorkspaceMode])

  const fetchRuang = async () => {
    try {
      setLoading(true)
      const data = await authService.getRuang()
      setRuang(data.filter(r => isWorkspaceMode ? r.is_workspace : !r.is_workspace))
    } catch (err) {
      toast.error('Gagal memuat daftar ruang edukasi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        nama_ruang: formData.nama_ruang,
        deskripsi: formData.deskripsi,
        hari: formData.hari !== "" ? Number(formData.hari) : null,
        jam_mulai: (!isWorkspaceMode && formData.hari !== "" && formData.jam_mulai) ? formData.jam_mulai : null,
        jam_selesai: (!isWorkspaceMode && formData.hari !== "" && formData.jam_selesai) ? formData.jam_selesai : null,
        ruangan: (!isWorkspaceMode && formData.hari !== "") ? formData.ruangan : null,
        warna: formData.warna,
        is_workspace: isWorkspaceMode
      }
      await authService.createRuang(payload)
      toast.success(isWorkspaceMode ? 'Workspace berhasil dibuat!' : 'Ruang kelas berhasil dibuat!')
      setShowCreate(false)
      setFormData({ 
        nama_ruang: '', 
        deskripsi: '',
        hari: '',
        jam_mulai: '',
        jam_selesai: '',
        ruangan: '',
        warna: '#8B6914'
      })
      fetchRuang()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat ruang.')
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    try {
      await authService.joinRuang(joinCode)
      toast.success('Berhasil bergabung dengan ruang!')
      setShowJoin(false)
      setJoinCode('')
      fetchRuang()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal bergabung dengan ruang.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus ruang kelas ini? Semua data di dalamnya akan terhapus.')) return
    try {
      await authService.deleteRuang(id)
      toast.success('Ruang berhasil dihapus.')
      fetchRuang()
    } catch (err) {
      toast.error('Gagal menghapus ruang.')
    }
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Kode berhasil disalin!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleShowMembers = async (r) => {
    try {
      const data = await authService.getRuangMembers(r.id)
      setMembersData(data)
      setSelectedRuangName(r.nama_ruang)
      setShowMembers(true)
    } catch (err) {
      toast.error('Gagal memuat anggota ruang.')
    }
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{isWorkspaceMode ? 'Workspace Kolaborasi' : 'Ruang Kelas'}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isWorkspaceMode ? 'Kelola proyek kolaboratif bersama tim Anda.' : (role === 'dosen' ? 'Kelola ruang kelas Anda dan bagikan kode ke mahasiswa.' : 'Daftar ruang kelas yang Anda ikuti.')}
          </p>
        </div>
        <div className="flex gap-2">
          {(!isWorkspaceMode && role === 'dosen') || isWorkspaceMode ? (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 border-4 border-black bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[#c2410c] focus:outline-none">
              <Plus size={18} className="stroke-[3]" /> Buat {isWorkspaceMode ? 'Workspace' : 'Ruang'}
            </button>
          ) : null}
          {(!isWorkspaceMode && role !== 'dosen') || isWorkspaceMode ? (
            <button onClick={() => setShowJoin(true)} className="flex items-center gap-2 border-4 border-black bg-white px-5 py-2.5 text-sm font-black text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-yellow-100 focus:outline-none">
              <LogIn size={18} className="stroke-[3]" /> Gabung {isWorkspaceMode ? 'Workspace' : 'Ruang'}
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-sm font-black uppercase text-black">Memuat data ruang...</div>
        </div>
      ) : ruang.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-4 border-black bg-white py-16 px-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center border-4 border-black bg-yellow-300">
            <Users2 size={40} className="text-black stroke-[3]" />
          </div>
          <h3 className="text-xl font-black uppercase text-black mb-2">{isWorkspaceMode ? 'Belum Ada Workspace' : 'Belum Ada Ruang Kelas'}</h3>
          <p className="text-sm font-bold text-black max-w-sm">
            {isWorkspaceMode ? 'Buat atau gabung workspace untuk mulai berkolaborasi.' : (role === 'dosen' ? 'Anda belum membuat ruang kelas apa pun. Buat ruang sekarang untuk membagikan tugas ke mahasiswa.' : 'Anda belum bergabung dengan ruang kelas mana pun. Minta kode dari dosen Anda.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ruang.map(r => (
            <div key={r.id} className="group relative flex flex-col border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none hover:translate-y-1 hover:translate-x-1">
              <h3 className="text-lg font-black uppercase text-black line-clamp-1 mb-2" title={r.nama_ruang}>{r.nama_ruang}</h3>
              <p className="text-sm font-bold text-gray-700 line-clamp-2 mb-4 h-10">
                {r.deskripsi || 'Tidak ada deskripsi'}
              </p>
              
              <div className="mt-auto pt-4 border-t-4 border-black flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => handleShowMembers(r)}
                    className="flex items-center gap-1.5 text-sm font-black text-black hover:text-[#ea580c] transition-colors whitespace-nowrap"
                  >
                    <Users size={16} className="stroke-[3]" /> 
                    {r.jumlah_anggota} anggota
                  </button>
                  
                  {((!isWorkspaceMode && role === 'dosen') || (isWorkspaceMode && user && r.kreator_id === user.id)) && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleCopy(r.kode_join)}
                        className="flex items-center gap-1.5 border-4 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-yellow-400 hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        title="Klik untuk menyalin kode"
                      >
                        {r.kode_join}
                        {copiedCode === r.kode_join ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} className="stroke-[3]" />}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="flex items-center justify-center p-1.5 border-4 border-black bg-red-500 text-white hover:bg-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"
                        title="Hapus Ruang"
                      >
                        <Trash2 size={16} className="stroke-[3]" />
                      </button>
                    </div>
                  )}
                </div>
                {role === 'mahasiswa' && (
                   <div className="text-xs font-black uppercase tracking-wider text-black flex flex-wrap items-center gap-2 mt-1">
                      <span>Dosen:</span>
                      <span className="bg-yellow-200 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] truncate max-w-[70%]" title={r.kreator_nama}>{r.kreator_nama}</span>
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create */}
      {showCreate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col">
            <div className="border-b-4 border-black bg-[#fef08a] p-6 flex-shrink-0 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black uppercase text-black">Buat {isWorkspaceMode ? 'Workspace Kolaborasi' : 'Ruang Kelas'} Baru</h3>
                <p className="mt-1 text-sm font-bold text-gray-700">{isWorkspaceMode ? 'Workspace ini digunakan untuk bekerja sama dalam tim.' : 'Ruang ini digunakan untuk mem-broadcast tugas ke mahasiswa.'}</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="hover:rotate-90 transition-transform"><X size={24} className="stroke-[3] text-black" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-black uppercase tracking-wider text-black">Nama Ruang</label>
                <input 
                  type="text" 
                  className="w-full border-4 border-black bg-white px-4 py-3 text-sm font-bold text-black placeholder-gray-500 outline-none transition-colors focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                  value={formData.nama_ruang} 
                  onChange={e => setFormData({...formData, nama_ruang: e.target.value})} 
                  required 
                  placeholder="Misal: Pemrograman Web - Pagi"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-black uppercase tracking-wider text-black">Deskripsi (Opsional)</label>
                <textarea 
                  className="w-full border-4 border-black bg-white px-4 py-3 text-sm font-bold text-black placeholder-gray-500 outline-none transition-colors focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none" 
                  value={formData.deskripsi} 
                  onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                  placeholder="Deskripsi singkat mengenai ruang ini..."
                  rows={3}
                />
              </div>

              {/* Schedule Fields */}
              {!isWorkspaceMode && (
                <div className="border-t-4 border-black pt-4 mt-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-black mb-3 bg-yellow-200 inline-block px-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Jadwal Kuliah (Opsional)</h4>
                
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-black uppercase tracking-wider text-black">Hari Kuliah</label>
                  <select 
                    className="w-full border-4 border-black bg-white px-4 py-3 text-sm font-bold text-black outline-none transition-colors focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    value={formData.hari}
                    onChange={e => setFormData({...formData, hari: e.target.value})}
                  >
                    <option value="">Tidak ada jadwal tetap</option>
                    <option value="1">Senin</option>
                    <option value="2">Selasa</option>
                    <option value="3">Rabu</option>
                    <option value="4">Kamis</option>
                    <option value="5">Jumat</option>
                    <option value="6">Sabtu</option>
                    <option value="0">Minggu</option>
                  </select>
                </div>

                {formData.hari !== "" && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase tracking-wider text-black">Jam Mulai</label>
                        <input 
                          type="time" 
                          className="w-full border-4 border-black bg-white px-4 py-3 text-sm font-bold text-black outline-none transition-colors focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          value={formData.jam_mulai}
                          onChange={e => setFormData({...formData, jam_mulai: e.target.value})}
                          required={formData.hari !== ""}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase tracking-wider text-black">Jam Selesai</label>
                        <input 
                          type="time" 
                          className="w-full border-4 border-black bg-white px-4 py-3 text-sm font-bold text-black outline-none transition-colors focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          value={formData.jam_selesai}
                          onChange={e => setFormData({...formData, jam_selesai: e.target.value})}
                          required={formData.hari !== ""}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-black uppercase tracking-wider text-black">Ruangan / Zoom Link</label>
                      <input 
                        type="text" 
                        className="w-full border-4 border-black bg-white px-4 py-3 text-sm font-bold text-black outline-none transition-colors focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        value={formData.ruangan}
                        onChange={e => setFormData({...formData, ruangan: e.target.value})}
                        placeholder="Misal: Ruang Lab 3 / Link Zoom"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-black uppercase tracking-wider text-black mb-2">Warna Tema Jadwal</label>
                      <div className="flex gap-2">
                        {[
                          { name: 'Gold', hex: '#B8842A' },
                          { name: 'Indigo', hex: '#4F46E5' },
                          { name: 'Emerald', hex: '#10B981' },
                          { name: 'Rose', hex: '#EF4444' },
                          { name: 'Violet', hex: '#8B5CF6' }
                        ].map(c => (
                          <button
                            key={c.hex}
                            type="button"
                            className={`w-8 h-8 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-none transition-all ${formData.warna === c.hex ? 'ring-4 ring-black ring-offset-2' : ''}`}
                            style={{ backgroundColor: c.hex }}
                            onClick={() => setFormData({...formData, warna: c.hex})}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              )}
              
              <div className="flex items-center justify-end gap-3 pt-6 border-t-4 border-black mt-6 flex-shrink-0">
                <button type="button" className="px-5 py-3 border-4 border-black bg-white font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all" onClick={() => setShowCreate(false)}>Batal</button>
                <button type="submit" className="px-5 py-3 border-4 border-black bg-[#ea580c] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#c2410c] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">Buat {isWorkspaceMode ? 'Workspace' : 'Ruang'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Join */}
      {showJoin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <div className="border-b-4 border-black p-6 text-center bg-[#fbcfe8]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users size={32} className="text-black stroke-[3]" />
              </div>
              <h3 className="text-xl font-black uppercase text-black">Gabung Ruang Edukasi</h3>
              <p className="mt-1 text-sm font-bold text-gray-700">Masukkan 6 digit kode dari dosen Anda.</p>
            </div>
            
            <form onSubmit={handleJoin} className="p-6">
              <div className="mb-6">
                <input 
                  type="text" 
                  className="w-full border-4 border-black bg-white px-4 py-4 text-center text-2xl font-black tracking-[0.3em] text-black placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-100 outline-none transition-colors uppercase" 
                  value={joinCode} 
                  onChange={e => setJoinCode(e.target.value.toUpperCase())} 
                  required 
                  maxLength={6}
                  placeholder="X7A9BQ"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button type="submit" disabled={joinCode.length !== 6} className="w-full border-4 border-black bg-[#ea580c] px-5 py-4 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#c2410c] hover:translate-y-1 hover:translate-x-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed">Gabung Sekarang</button>
                <button type="button" className="w-full border-4 border-black bg-white px-5 py-4 text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-yellow-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none" onClick={() => setShowJoin(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ANGGOTA */}
      {showMembers && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black uppercase text-black">Anggota Ruang</h3>
            <p className="text-sm font-bold text-gray-700 mb-6 pb-4 border-b-4 border-black">{selectedRuangName}</p>
            
            <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
              {/* Dosen / Kreator */}
              {membersData.kreator && (
                <div className="mb-6">
                  <h4 className="text-sm font-black uppercase tracking-wider text-black mb-3 bg-yellow-200 inline-block px-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {isWorkspaceMode ? 'Pembuat Workspace' : 'Tenaga Pengajar (Dosen)'}
                  </h4>
                  <div className="flex items-center gap-4 p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-1">
                    <div className="w-12 h-12 border-4 border-black bg-[#ea580c] text-white flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {membersData.kreator.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-black text-sm uppercase">{membersData.kreator.nama}</div>
                      <div className="text-xs font-bold text-gray-700">{membersData.kreator.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mahasiswa */}
              <div className="pt-2 pb-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-black mb-3 bg-[#fbcfe8] inline-block px-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {isWorkspaceMode ? 'Anggota Workspace' : 'Mahasiswa'} ({membersData.anggota.length})
                </h4>
                {membersData.anggota.length === 0 ? (
                  <p className="text-sm font-bold text-gray-500 italic mt-2">Belum ada anggota yang bergabung.</p>
                ) : (
                  <div className="space-y-4 mt-4">
                    {membersData.anggota.map(m => (
                      <div key={m.id} className="flex items-center gap-4 p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-10 h-10 border-4 border-black bg-blue-300 text-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {m.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-black text-sm uppercase">{m.nama}</div>
                          <div className="text-xs font-bold text-gray-700">{m.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-4 border-black flex justify-end">
              <button 
                onClick={() => setShowMembers(false)}
                className="px-6 py-3 border-4 border-black bg-white font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
