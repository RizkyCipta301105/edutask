/**
 * Layout bersama untuk halaman Login & Register
 * Desain: split panel - ilustrasi kiri, form kanan
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600 rounded-full opacity-40" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-primary-800 rounded-full opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500 rounded-full opacity-10" />

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
        <div className="relative z-10 space-y-6">
          <h1 className="text-white font-display text-4xl font-bold leading-tight">
            Kelola Tugas<br />
            <span className="text-primary-300">Kuliah Lebih</span><br />
            Terorganisir
          </h1>
          <p className="text-primary-200 text-base leading-relaxed max-w-xs">
            Satu platform untuk semua tugas, jadwal, dan deadline kuliah kamu. Tidak ada lagi yang terlewat.
          </p>

          {/* Feature badges */}
          <div className="flex flex-col gap-2.5">
            {[
              '📋  Kanban Board Visual',
              '📅  Kalender Interaktif',
              '🔔  Reminder Otomatis',
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 bg-primary-600 bg-opacity-50 rounded-xl px-4 py-2.5 w-fit"
              >
                <span className="text-white text-sm font-medium">{f}</span>
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
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-surface">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-bold">E</span>
          </div>
          <span className="text-primary-800 font-display text-xl font-bold">EduTask</span>
        </div>

        <div className="w-full max-w-md">
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
