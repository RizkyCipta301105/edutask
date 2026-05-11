import { Navigate } from 'react-router-dom'
import { BarChart3, BookOpen, CalendarDays, CheckCircle2, Clock, GraduationCap, ListChecks, Users } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import KanbanBoard from '../components/kanban/KanbanBoard'
import { useAuth } from '../context/AuthContext'
import { getRoleDashboardPath, normalizeUserRole } from '../utils/authHelpers'

function StatCard({ icon: Icon, label, value, tone = 'gold' }) {
  const tones = {
    gold: 'bg-[#FBF4E6] text-[#8B6914]',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

function RoleHeader({ role, user }) {
  const copy = {
    mahasiswa: {
      title: 'Dashboard Mahasiswa',
      subtitle: 'Pantau task aktif, jadwal kuliah, dan deadline penting.',
    },
    dosen: {
      title: 'Dashboard Dosen',
      subtitle: 'Kelola jadwal mengajar, tugas yang diberikan, dan statistik mahasiswa.',
    },
    umum: {
      title: 'Personal Task Dashboard',
      subtitle: 'Kelola task personal dan progres pekerjaan harian.',
    },
  }[role]

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#B8842A]">{role}</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">{copy.title}</h1>
        <p className="mt-2 text-slate-500">{copy.subtitle}</p>
      </div>
      <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
        {user?.nama_lengkap}
      </div>
    </div>
  )
}

function MahasiswaDashboard() {
  return (
    <>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={ListChecks} label="Task aktif" value="Aktif" />
        <StatCard icon={CalendarDays} label="Jadwal kuliah" value="Mingguan" tone="blue" />
        <StatCard icon={Clock} label="Deadline" value="Prioritas" tone="green" />
      </div>
      <KanbanBoard />
    </>
  )
}

function DosenDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={BookOpen} label="Jadwal mengajar" value="Hari ini" tone="blue" />
        <StatCard icon={CheckCircle2} label="Tugas diberikan" value="Terpantau" />
        <StatCard icon={Users} label="Statistik mahasiswa" value="Aktif" tone="green" />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FBF4E6] text-[#8B6914]">
            <BarChart3 size={21} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">Ringkasan Dosen</h2>
            <p className="text-sm text-slate-500">Fondasi dashboard dosen untuk Sprint berikutnya.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {['Jadwal mengajar tersimpan', 'Daftar tugas yang diberikan', 'Statistik mahasiswa siap dikembangkan'].map(item => (
            <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function UmumDashboard() {
  return (
    <>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={ListChecks} label="Personal task" value="Board" />
        <StatCard icon={Clock} label="Deadline" value="Terjadwal" tone="blue" />
        <StatCard icon={CheckCircle2} label="Progress" value="Tracked" tone="green" />
      </div>
      <KanbanBoard />
    </>
  )
}

export default function DashboardPage({ roleView = null }) {
  const { user } = useAuth()
  const role = normalizeUserRole(user)

  if (!roleView) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }

  if (roleView !== role) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:pl-[18rem] lg:pt-28">
        <RoleHeader role={roleView} user={user} />
        {roleView === 'dosen' ? <DosenDashboard /> : roleView === 'umum' ? <UmumDashboard /> : <MahasiswaDashboard />}
      </main>
    </div>
  )
}
