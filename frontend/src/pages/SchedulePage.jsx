import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock, MapPin, Plus, Trash2, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import InputField from '../components/common/InputField'
import LoadingState from '../components/common/LoadingState'
import Navbar from '../components/common/Navbar'
import SelectField from '../components/common/SelectField'
import SubmitButton from '../components/common/SubmitButton'
import scheduleService from '../services/scheduleService'
import { getApiErrorMessage } from '../utils/apiErrors'

const DAYS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
const LABELS = { senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis', jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu' }

export default function SchedulePage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ hari: 'senin', jam: '', ruangan: '', dosen: '', mata_kuliah: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      setItems(await scheduleService.getSchedules())
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal memuat jadwal.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSchedules() }, [])

  const grouped = useMemo(() => DAYS.reduce((acc, day) => {
    acc[day] = items.filter(item => item.hari === day)
    return acc
  }, {}), [items])

  const submit = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      await scheduleService.createSchedule(form)
      toast.success('Jadwal kuliah disimpan.')
      setForm({ hari: 'senin', jam: '', ruangan: '', dosen: '', mata_kuliah: '' })
      fetchSchedules()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal menyimpan jadwal.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      await scheduleService.deleteSchedule(id)
      toast.success('Jadwal dihapus.')
      fetchSchedules()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal menghapus jadwal.'))
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:pl-[18rem] lg:pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-950 sm:text-4xl">Jadwal Kuliah</h1>
          <p className="mt-2 text-zinc-500">Kelola jadwal mingguan, ruangan, dosen, dan mata kuliah.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <form onSubmit={submit} className="rounded-md border border-zinc-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2 text-lg font-bold text-zinc-950">
              <Plus size={20} />
              Tambah Jadwal
            </div>
            <div className="grid gap-4">
              <SelectField name="hari" label="Hari" value={form.hari} onChange={(e) => setForm(v => ({ ...v, hari: e.target.value }))} className="rounded-md">
                {DAYS.map(day => <option key={day} value={day}>{LABELS[day]}</option>)}
              </SelectField>
              <InputField name="jam" label="Jam" placeholder="Jam, contoh 08:00-10:00" value={form.jam} onChange={(e) => setForm(v => ({ ...v, jam: e.target.value }))} className="rounded-md" required />
              <InputField name="mata_kuliah" label="Mata Kuliah" placeholder="Mata kuliah" value={form.mata_kuliah} onChange={(e) => setForm(v => ({ ...v, mata_kuliah: e.target.value }))} className="rounded-md" required />
              <InputField name="ruangan" label="Ruangan" placeholder="Ruangan" value={form.ruangan} onChange={(e) => setForm(v => ({ ...v, ruangan: e.target.value }))} className="rounded-md" required />
              <InputField name="dosen" label="Dosen" placeholder="Dosen" value={form.dosen} onChange={(e) => setForm(v => ({ ...v, dosen: e.target.value }))} className="rounded-md" required />
              <SubmitButton loading={saving} className="btn-primary rounded-md">
                Simpan Jadwal
              </SubmitButton>
            </div>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="md:col-span-2">
                <LoadingState message="Memuat jadwal..." className="min-h-48" />
              </div>
            ) : DAYS.map(day => (
              <section key={day} className="min-h-48 rounded-md border border-zinc-200 bg-white">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                  <div className="flex items-center gap-2 font-bold text-zinc-950">
                    <CalendarDays size={17} />
                    {LABELS[day]}
                  </div>
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">{grouped[day].length}</span>
                </div>
                <div className="space-y-3 p-4">
                  {grouped[day].length === 0 ? (
                    <p className="text-sm text-zinc-400">Tidak ada jadwal.</p>
                  ) : grouped[day].map(item => (
                    <article key={item.id} className="rounded-md border border-zinc-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-950">{item.mata_kuliah}</p>
                          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><Clock size={14} />{item.jam}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={14} />{item.ruangan}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500"><UserRound size={14} />{item.dosen}</p>
                        </div>
                        <button onClick={() => remove(item.id)} className="rounded-md p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
