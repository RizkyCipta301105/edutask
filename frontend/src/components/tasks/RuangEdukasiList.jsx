import React, { useState, useEffect } from 'react'
import { Plus, Users, Copy, Check, Users2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '../../services/authService'

export default function RuangEdukasiList({ role }) {
  const [ruang, setRuang] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  
  const [formData, setFormData] = useState({ nama_ruang: '', deskripsi: '' })
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)
  
  const [showMembers, setShowMembers] = useState(false)
  const [membersData, setMembersData] = useState({ kreator: null, anggota: [] })
  const [selectedRuangName, setSelectedRuangName] = useState('')

  useEffect(() => {
    fetchRuang()
  }, [])

  const fetchRuang = async () => {
    try {
      setLoading(true)
      const data = await authService.getRuang()
      setRuang(data)
    } catch (err) {
      toast.error('Gagal memuat daftar ruang edukasi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await authService.createRuang(formData)
      toast.success('Ruang berhasil dibuat!')
      setShowCreate(false)
      setFormData({ nama_ruang: '', deskripsi: '' })
      fetchRuang()
    } catch (err) {
      toast.error('Gagal membuat ruang.')
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
          <h2 className="text-2xl font-bold text-slate-800">Ruang Edukasi</h2>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'dosen' ? 'Kelola ruang kelas Anda dan bagikan kode ke mahasiswa.' : 'Daftar ruang kelas yang Anda ikuti.'}
          </p>
        </div>
        <div>
          {role === 'dosen' ? (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-[#4B3A2F] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#3D2F26] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#D2A34E]/30">
              <Plus size={18} /> Buat Ruang
            </button>
          ) : (
            <button onClick={() => setShowJoin(true)} className="flex items-center gap-2 rounded-xl bg-[#4B3A2F] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#3D2F26] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#D2A34E]/30">
              <Plus size={18} /> Gabung Ruang
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-sm font-semibold text-slate-500">Memuat data ruang...</div>
        </div>
      ) : ruang.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 shadow-sm text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
            <Users2 size={40} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Ruang Edukasi</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {role === 'dosen' ? 'Anda belum membuat ruang edukasi apa pun. Buat ruang sekarang untuk membagikan tugas ke mahasiswa.' : 'Anda belum bergabung dengan ruang edukasi mana pun. Minta kode dari dosen Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ruang.map(r => (
            <div key={r.id} className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#D2A34E]/50 hover:shadow-md">
              <h3 className="text-base font-bold text-slate-800 line-clamp-1 mb-2" title={r.nama_ruang}>{r.nama_ruang}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">
                {r.deskripsi || 'Tidak ada deskripsi'}
              </p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => handleShowMembers(r)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#B8842A] transition-colors"
                >
                  <Users size={14} className="text-slate-400" /> 
                  {r.jumlah_anggota} anggota
                </button>
                
                {role === 'dosen' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleCopy(r.kode_join)}
                      className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold tracking-wider text-[#B8842A] transition-colors hover:bg-orange-100 ring-1 ring-inset ring-orange-500/10"
                      title="Klik untuk menyalin kode"
                    >
                      {r.kode_join}
                      {copiedCode === r.kode_join ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="flex items-center justify-center p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Hapus Ruang"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                {role === 'mahasiswa' && (
                   <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Dosen: <span className="text-slate-600">{r.kreator_nama}</span>
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800">Buat Ruang Edukasi Baru</h3>
              <p className="mt-1 text-xs text-slate-500">Ruang ini digunakan untuk mem-broadcast tugas ke mahasiswa.</p>
            </div>
            
            <form onSubmit={handleCreate} className="p-6">
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Ruang</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#B8842A] focus:bg-white focus:ring-4 focus:ring-[#D2A34E]/20" 
                  value={formData.nama_ruang} 
                  onChange={e => setFormData({...formData, nama_ruang: e.target.value})} 
                  required 
                  placeholder="Misal: Pemrograman Web - Pagi"
                />
              </div>
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Deskripsi (Opsional)</label>
                <textarea 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#B8842A] focus:bg-white focus:ring-4 focus:ring-[#D2A34E]/20 resize-none" 
                  value={formData.deskripsi} 
                  onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                  placeholder="Deskripsi singkat mengenai ruang ini..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100" onClick={() => setShowCreate(false)}>Batal</button>
                <button type="submit" className="rounded-xl bg-[#4B3A2F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3D2F26]">Buat Ruang</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Join */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                <Users size={24} className="text-[#B8842A]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Gabung Ruang Edukasi</h3>
              <p className="mt-1 text-xs text-slate-500">Masukkan 6 digit kode dari dosen Anda.</p>
            </div>
            
            <form onSubmit={handleJoin} className="p-6">
              <div className="mb-6">
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-xl font-black tracking-[0.3em] text-slate-900 placeholder-slate-300 outline-none transition-all focus:border-[#B8842A] focus:bg-white focus:ring-4 focus:ring-[#D2A34E]/20 uppercase" 
                  value={joinCode} 
                  onChange={e => setJoinCode(e.target.value.toUpperCase())} 
                  required 
                  maxLength={6}
                  placeholder="X7A9BQ"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button type="submit" disabled={joinCode.length !== 6} className="w-full rounded-xl bg-[#4B3A2F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3D2F26] disabled:opacity-50 disabled:cursor-not-allowed">Gabung Sekarang</button>
                <button type="button" className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100" onClick={() => setShowJoin(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ANGGOTA */}
      {showMembers && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-900">Anggota Ruang</h3>
            <p className="text-sm text-slate-500 mb-6">{selectedRuangName}</p>
            
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
              {/* Dosen / Kreator */}
              {membersData.kreator && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tenaga Pengajar (Dosen)</h4>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#B8842A] text-white flex items-center justify-center font-bold text-lg">
                      {membersData.kreator.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{membersData.kreator.nama}</div>
                      <div className="text-xs text-slate-500">{membersData.kreator.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mahasiswa */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Mahasiswa ({membersData.anggota.length})</h4>
                {membersData.anggota.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Belum ada mahasiswa yang bergabung.</p>
                ) : (
                  <div className="space-y-2">
                    {membersData.anggota.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm">
                          {m.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{m.nama}</div>
                          <div className="text-xs text-slate-500">{m.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowMembers(false)}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
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
