/** Warna badge per prioritas */
export const PRIORITAS_STYLE = {
  tinggi: { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Tinggi' },
  sedang: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Sedang' },
  rendah: { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Rendah' },
}

export const STATUS_META = {
  todo:        { label: 'To Do',       color: 'text-slate-600',  bg: 'bg-slate-100',   border: 'border-slate-300' },
  in_progress: { label: 'In Progress', color: 'text-blue-700',   bg: 'bg-blue-50',     border: 'border-blue-300'  },
  done:        { label: 'Done',        color: 'text-green-700',  bg: 'bg-green-50',    border: 'border-green-300' },
}

/** Hitung sisa hari dari deadline */
export function sisaHari(deadline) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(deadline)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
}

export function deadlineBadge(deadline, isDone) {
  if (isDone) return { text: 'Selesai', cls: 'text-green-600 bg-green-50' }
  const sisa = sisaHari(deadline)
  if (sisa < 0)  return { text: `Terlambat ${Math.abs(sisa)}h`, cls: 'text-red-600 bg-red-50' }
  if (sisa === 0) return { text: 'Hari ini!', cls: 'text-orange-600 bg-orange-50' }
  if (sisa <= 3)  return { text: `${sisa} hari lagi`, cls: 'text-orange-500 bg-orange-50' }
  return { text: `${sisa} hari lagi`, cls: 'text-slate-500 bg-slate-50' }
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
