import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LogOut, User, LayoutDashboard, ClipboardList,
  CalendarDays, Settings, Search, Bell, HelpCircle, BookOpen,
  Moon, Sun
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil logout.')
    navigate('/login')
  }

  const navLinks = [
    { path: '/dashboard', label: 'Board', icon: LayoutDashboard },
    { path: '/tasks', label: 'Task Management', icon: ClipboardList },
    { path: '/schedule', label: 'Jadwal Kuliah', icon: CalendarDays },
    { path: '/profile', label: 'Settings', icon: Settings },
  ]

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-zinc-200 bg-white">
        <div className="flex items-center gap-4 px-6 py-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-950">EduTask</p>
            <p className="text-sm text-zinc-500">Student planner</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 px-4">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <button key={path} onClick={() => navigate(path)}
              aria-current={pathname === path ? 'page' : undefined}
              className={`flex items-center gap-4 rounded-md px-4 py-3 text-left text-base font-medium transition-colors
                ${pathname === path
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                }`}>
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-zinc-200 p-4">
          <button onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white lg:fixed lg:left-64 lg:right-0">
        <div className="flex min-h-20 items-center gap-3 px-4 lg:px-8">
          <button onClick={() => navigate('/dashboard')}
            className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-white font-bold">
            E
          </button>
          <div className="relative hidden flex-1 sm:block lg:max-w-3xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              className="h-12 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-base outline-none transition focus:border-zinc-400 focus:bg-white"
              placeholder="Search"
              readOnly
            />
          </div>
          <div className="min-w-0 flex-1 sm:hidden">
            <p className="truncate text-sm font-semibold text-zinc-950">EduTask</p>
            <p className="truncate text-xs text-zinc-500">{user?.nama_lengkap || 'Student planner'}</p>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100" 
            title={isDark ? "Matikan Dark Mode" : "Nyalakan Dark Mode"}
          >
            {isDark ? <Sun size={21} /> : <Moon size={21} />}
          </button>
          <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100" title="Help">
            <HelpCircle size={21} />
          </button>
          <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100" title="Notifications">
            <Bell size={21} />
          </button>
          <button onClick={() => navigate('/profile')}
            className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-zinc-200 px-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-300">
            <User size={18} />
            <span className="hidden md:block">{user?.nama_lengkap?.split(' ')[0]}</span>
          </button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden" aria-label="Navigasi utama">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-current={pathname === path ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                pathname === path
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </header>
    </>
  )
}
