/**
 * Layout bersama untuk halaman Login & Register
 * Desain: split panel - ilustrasi kiri, form kanan
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#B8842A] rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[120px]" />
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[150px] opacity-50" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">E</span>
            </div>
            <span className="text-white font-display text-2xl font-bold tracking-tight">EduTask</span>
          </div>
          <p className="text-primary-200 text-sm mt-2 font-medium tracking-widest uppercase">
            Innovate · Automate · Elevate
          </p>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-8 mt-12">
          <h1 className="text-white font-display text-5xl font-bold leading-[1.15] tracking-tight">
            Kelola Tugas<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D2A34E] to-[#FDE68A]">Kuliah Lebih</span><br />
            Terorganisir
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-sm font-light">
            Satu platform elegan untuk semua tugas, jadwal, dan deadline kuliah kamu. Tidak ada lagi yang terlewat.
          </p>

          {/* Feature badges */}
          <div className="flex flex-col gap-3 pt-4">
            {[
              { icon: '📋', text: 'Kanban Board Visual' },
              { icon: '📅', text: 'Kalender Interaktif' },
              { icon: '🔔', text: 'Reminder Otomatis' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5 w-fit hover:bg-white/10 transition-colors shadow-xl"
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-slate-100 text-sm font-semibold tracking-wide">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-primary-300 text-xs">
            © 2026 Tim Sumber Rejeki · PENS
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-50/50 relative">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-display font-bold text-lg">E</span>
          </div>
          <span className="text-slate-900 font-display text-2xl font-bold tracking-tight">EduTask</span>
        </div>

        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10">
          <div className="mb-8 animate-fade-up">
            <h2 className="text-2xl font-display font-bold text-primary-800">{title}</h2>
            {subtitle && (
              <p className="text-primary-500 mt-1 text-sm">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
