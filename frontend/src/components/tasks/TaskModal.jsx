/**
 * TaskModal – FR-04 (Create) & FR-05 (Edit)
 * Modal form untuk membuat dan mengedit task
 */
import { useEffect } from 'react'
import { X, Calendar, BookOpen, AlignLeft, Save, CircleDashed } from 'lucide-react'
import { useForm } from '../../hooks/useForm'
import InputField from '../common/InputField'
import SelectField from '../common/SelectField'
import SubmitButton from '../common/SubmitButton'
import TextareaField from '../common/TextareaField'
import { PRIORITAS_STYLE } from '../../utils/taskHelpers'

const PRIORITAS_OPTIONS = ['tinggi', 'sedang', 'rendah']
const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export default function TaskModal({ task = null, mataKuliah = [], onSave, onClose }) {
  const isEdit = !!task

  const { values, errors, loading, handleChange, setValue,
          handleSubmit, setApiErrors, reset } = useForm({
    judul:       task?.judul       || '',
    deskripsi:   task?.deskripsi   || '',
    deadline:    task?.deadline    || '',
    prioritas:   task?.prioritas   || 'sedang',
    status:      task?.status      || 'todo',
    mata_kuliah: task?.mata_kuliah || '',
  })

  // Reset saat task berubah
  useEffect(() => {
    reset()
  }, [task?.id])

  const onSubmit = handleSubmit(async (vals) => {
    try {
      const payload = { ...vals, mata_kuliah: vals.mata_kuliah || null }
      await onSave(payload)
      onClose()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) setApiErrors(apiErrors)
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-[#fef08a]">
          <h2 className="text-xl font-black uppercase tracking-wide text-black">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose}
            className="text-black hover:rotate-90 transition-transform p-1">
            <X size={24} className="stroke-[3]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">

          {/* Judul */}
          <InputField
            label="Judul Task"
            name="judul"
            value={values.judul}
            onChange={handleChange}
            error={errors.judul}
            placeholder="Contoh: UTS Pemrograman Web"
            icon={AlignLeft}
            required
          />

          {/* Deadline */}
          <InputField
            label="Deadline"
            name="deadline"
            type="date"
            value={values.deadline}
            onChange={handleChange}
            error={errors.deadline}
            icon={Calendar}
            required
          />

          {/* Prioritas */}
          <div className="flex flex-col gap-1.5">
            <label className="label">
              Prioritas <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {PRIORITAS_OPTIONS.map((p) => {
                const s = PRIORITAS_STYLE[p]
                const active = values.prioritas === p
                return (
                  <button key={p} type="button"
                    onClick={() => setValue('prioritas', p)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-black transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-none uppercase
                      ${active
                        ? `${s.bg} text-white`
                        : 'bg-white text-black hover:bg-yellow-300'
                      }`}>
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    {p}
                  </button>
                )
              })}
            </div>
            {errors.prioritas && <p className="error-text">{errors.prioritas}</p>}
          </div>

          <SelectField
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
            error={errors.status}
            icon={CircleDashed}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </SelectField>

          {/* Mata Kuliah */}
          <SelectField
            label="Mata Kuliah"
            name="mata_kuliah"
            value={values.mata_kuliah}
            onChange={handleChange}
            error={errors.mata_kuliah}
            icon={BookOpen}
            optional
          >
            <option value="">— Tanpa mata kuliah —</option>
            {mataKuliah.map(mk => (
              <option key={mk.id} value={mk.id}>{mk.nama}</option>
            ))}
          </SelectField>

          {/* Deskripsi */}
          <TextareaField
            label="Deskripsi"
            name="deskripsi"
            value={values.deskripsi}
            onChange={handleChange}
            error={errors.deskripsi}
            placeholder="Tambahkan catatan atau detail task..."
            optional
          />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <SubmitButton loading={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save size={16} />
              {isEdit ? 'Simpan Perubahan' : 'Buat Task'}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
