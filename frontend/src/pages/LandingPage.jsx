import { Link } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import KanbanDemo from '../components/landing/KanbanDemo';
import { Layout, Clock, Users, BarChart3, ShieldCheck, MessageSquare, Shield, CreditCard, Twitter, Github, Facebook, Heart, Check, Minus } from 'lucide-react';

export default function LandingPage() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-black flex flex-col bg-white border-t-8 border-black">
      
      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center flex-wrap gap-4">
          <Link
            to="/"
            className="text-3xl font-black tracking-tighter border-4 border-black px-4 py-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none hover:bg-yellow-100 transition-all text-black"
          >
            EduTask
          </Link>

          <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
            <nav className="flex items-center gap-3 sm:gap-6 font-bold text-xs sm:text-sm tracking-wide">
              <button
                onClick={() => scrollToSection('features-section')}
                className="hover:underline decoration-4 underline-offset-4 text-black px-2 py-1 uppercase"
              >
                FEATURES
              </button>
              <button
                onClick={() => scrollToSection('pricing-section')}
                className="hover:underline decoration-4 underline-offset-4 text-black px-2 py-1 uppercase"
              >
                PRICING
              </button>
              <button
                onClick={() => scrollToSection('demo-section')}
                className="hover:underline decoration-4 underline-offset-4 text-black px-2 py-1 uppercase"
              >
                DEMO
              </button>
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/login"
                className="hidden sm:inline-block hover:underline decoration-2 text-sm font-bold text-black px-3 py-1 uppercase font-black"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="bg-[#ea580c] text-white text-xs sm:text-sm font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-4 py-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase inline-block text-center"
              >
                SIGN UP FREE
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <section id="features-section" className="py-16 md:py-24 border-b-4 border-black px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
          
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase text-black tracking-tight leading-none">
              Modul EduTask
            </h2>
            <div className="h-2 w-32 bg-yellow-300 border-2 border-black mx-auto mb-4" />
            <p className="text-lg sm:text-xl font-bold text-gray-800 uppercase">
              Satu Sistem Terpadu untuk Produktivitas Maksimal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                title: 'Papan Kanban & Manajemen Tugas',
                desc: 'Kelola tugas pribadi maupun tugas terdistribusi dengan prioritas dinamis, tag khusus, dan kolom visual interaktif.',
                bg: 'bg-[#1A237E]',
                icon: <Layout className="w-12 h-12 stroke-[2.5]" />,
                badge: 'KANBAN',
              },
              {
                title: 'Ruang Edukasi & Kode Join',
                desc: 'Dosen dapat membuat kelas virtual dinamis dengan kode bergabung unik. Mahasiswa secara otomatis memperoleh sinkronisasi jadwal.',
                bg: 'bg-[#FF4D00]',
                icon: <Users className="w-12 h-12 stroke-[2.5]" />,
                badge: 'RUANG',
              },
              {
                title: 'Jadwal Kuliah & Kalender',
                desc: 'Sinkronisasi agenda pribadi dengan jadwal resmi dari Ruang Edukasi secara otomatis dari tanggal pembuatan ruang.',
                bg: 'bg-[#2E7D32]',
                icon: <Clock className="w-12 h-12 stroke-[2.5]" />,
                badge: 'JADWAL',
              },
              {
                title: 'Inbox & Chat Kolaborasi',
                desc: 'Ruang komunikasi terintegrasi untuk diskusi tugas, obrolan tim harian, serta pengajuan pertanyaan langsung kepada Dosen.',
                bg: 'bg-[#F9A825]',
                icon: <MessageSquare className="w-12 h-12 stroke-[2.5]" />,
                badge: 'CHATS',
              },
              {
                title: 'Laporan & Analitik Visual',
                desc: 'Grafik komparasi statistik tugas selesai dan kalkulasi visual alokasi pengerjaan secara waktu nyata.',
                bg: 'bg-[#c2410c]',
                icon: <BarChart3 className="w-12 h-12 stroke-[2.5]" />,
                badge: 'REPORTS',
              },
              {
                title: 'Multi-Role Auth (Selamat)',
                desc: 'Akses terisolasi berbasis peran untuk Mahasiswa, Dosen, dan Umum, lengkap dengan validasi terenkripsi.',
                bg: 'bg-black',
                icon: <ShieldCheck className="w-12 h-12 stroke-[2.5]" />,
                badge: 'SECURITY',
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`${f.bg} text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between hover:-translate-y-2 hover:translate-x-[-2px] hover:shadow-lg transition-all duration-200 min-h-[260px] relative overflow-hidden group`}
              >
                <div className="absolute top-4 right-4 bg-yellow-300 text-black font-bold text-xs px-2.5 py-1 border-2 border-black select-none">
                  {f.badge}
                </div>

                <div className="relative z-10 mb-6 text-white shrink-0">
                  {f.icon}
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-xl sm:text-2xl font-black mb-3 uppercase tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-100 max-w-lg">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing-section" className="py-20 bg-[#111111] text-white overflow-hidden relative border-b-4 border-black px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto relative z-10">

            <div className="text-center mb-16">
              <div className="inline-block bg-yellow-300 text-black font-bold text-xs uppercase px-3 py-1 border-2 border-black mb-4 rotate-[-1deg]">
                BIAYA TERJANGKAU, HASIL OPTIMAL
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase text-white tracking-tight leading-none">
                PRICING CARD
              </h2>
              <div className="h-2 w-32 bg-[#FF4D00] border-2 border-black mx-auto mb-4" />
              <p className="text-lg sm:text-xl text-gray-400">
                No hidden fees. Just raw productivity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 items-stretch">

              {/* Free */}
              <div className="bg-black border-[3px] border-white p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150">
                <div>
                  <div className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">UNTUK PERSONAL</div>
                  <h3 className="text-3xl font-black mb-4">FREE</h3>
                  <div className="text-5xl font-black mb-8 text-white">
                    Rp 0<span className="text-sm font-normal text-gray-400">/bulan</span>
                  </div>
                  <ul className="font-mono space-y-4 mb-8 border-t border-gray-800 pt-6">
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Kanban board pribadi
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Kalender & jadwal
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Notifikasi in-app
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="shrink-0">–</span>
                      Ruang Edukasi
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="shrink-0">–</span>
                      Inbox kolaborasi
                    </li>
                  </ul>
                </div>
                <Link to="/checkout?plan=free" className="w-full bg-black text-white hover:bg-white hover:text-black font-black py-4 border-[3px] border-white transition-all uppercase text-center inline-block shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] active:translate-y-[2px] active:shadow-none">
                  Mulai Free
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-black border-[4px] border-[#FF4D00] p-8 flex flex-col justify-between relative transform md:-translate-y-4 shadow-[10px_10px_0px_0px_#FF4D00]">
                <div className="absolute top-0 right-0 bg-[#FF4D00] text-white text-xs font-black px-4 py-1.5 tracking-wider uppercase">
                  REKOMENDASI UTAMA
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[#FF4D00] uppercase tracking-widest mb-1">MAHASISWA & DOSEN</div>
                  <h3 className="text-3xl font-black mb-4 text-[#FF4D00]">PRO</h3>
                  <div className="text-5xl font-black mb-8 text-white">
                    Rp 4.999<span className="text-sm font-normal text-gray-400">/bulan</span>
                  </div>
                  <ul className="font-mono space-y-4 mb-8 border-t border-[#FF4D00]/50 pt-6">
                    <li className="flex items-center gap-3 text-sm text-white">
                      <span className="text-white font-bold shrink-0">▸</span>
                      <span className="font-bold">Semua fitur Free</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-200">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Ruang Edukasi & kode join
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-200">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Inbox & chat kolaborasi
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-200">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Broadcast tugas (Dosen)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-200">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Laporan & analitik
                    </li>
                  </ul>
                </div>
                <Link to="/checkout?plan=pro" className="w-full bg-[#FF4D00] text-white hover:bg-[#cc3d00] font-black py-4 border-[3px] border-black transition-all uppercase text-center inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
                  GO PRO →
                </Link>
              </div>

              {/* Team */}
              <div className="bg-black border-[3px] border-white p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150">
                <div>
                  <div className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">UNTUK INSTITUSI</div>
                  <h3 className="text-3xl font-black mb-4">TEAM</h3>
                  <div className="text-5xl font-black mb-8 text-white">
                    Rp 9.999<span className="text-sm font-normal text-gray-400">/bulan</span>
                  </div>
                  <ul className="font-mono space-y-4 mb-8 border-t border-gray-800 pt-6">
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-white font-bold shrink-0">▸</span>
                      <span className="font-bold text-white">Semua fitur Pro</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Hingga 10 anggota
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Multiple Ruang Edukasi
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Export laporan CSV
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-white font-bold shrink-0">▸</span>
                      Prioritas support
                    </li>
                  </ul>
                </div>
                <Link to="/checkout?plan=team" className="w-full bg-black text-white hover:bg-white hover:text-black font-black py-4 border-[3px] border-white transition-all uppercase text-center inline-block shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] active:translate-y-[2px] active:shadow-none">
                  Get Team
                </Link>
              </div>

            </div>

            <div className="mt-12 text-center font-mono text-xs text-gray-600">
              Garansi uang kembali 14 hari. Batalkan kapan saja.
            </div>

          </div>
        </section>

        {/* Kanban Demo Section */}
        <KanbanDemo />

      </main>

      {/* Footer */}
      <footer className="bg-black text-white border-t-8 border-black mt-0">

        {/* Upper grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-12 font-mono">

          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-4xl font-black tracking-tighter uppercase text-white hover:text-yellow-300 transition-colors inline-block select-none">
              EduTask
            </h2>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              The boldest task manager for unstoppable doers. Organized. Executed. Conquered. Didesain khusus dengan visual Neo-Brutalist berbobot ringan dan responsif maksimal.
            </p>
            <div className="flex gap-4 pt-3">
              {[Twitter, Github, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white hover:bg-yellow-300 border-2 border-black text-black flex items-center justify-center transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold uppercase text-[#ea580c] text-sm tracking-wider border-b-2 border-gray-800 pb-1">Product</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><button onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-yellow-300 hover:underline transition-all uppercase">FEATURES</button></li>
              <li><button onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-yellow-300 hover:underline transition-all uppercase">PRICING</button></li>
              <li><button onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-yellow-300 hover:underline transition-all uppercase">DEMO LIVE</button></li>
            </ul>
          </div>

          {/* Company links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold uppercase text-[#ea580c] text-sm tracking-wider border-b-2 border-gray-800 pb-1">Company</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#" className="hover:text-yellow-300 hover:underline transition-all uppercase">ABOUT</a></li>
              <li><a href="#" className="hover:text-yellow-300 hover:underline transition-all uppercase">CAREERS</a></li>
              <li><a href="#" className="hover:text-yellow-300 hover:underline transition-all uppercase">PRIVACY POLICY</a></li>
            </ul>
          </div>

          {/* Resources links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold uppercase text-[#ea580c] text-sm tracking-wider border-b-2 border-gray-800 pb-1">Resources</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#" className="hover:text-yellow-300 hover:underline transition-all uppercase">BLOG POSTS</a></li>
              <li><a href="#" className="hover:text-yellow-300 hover:underline transition-all uppercase">CONTACT US</a></li>
              <li><a href="#" className="hover:text-yellow-300 hover:underline transition-all uppercase">CUSTOMER SUPPORT</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t-4 border-gray-900 py-6 px-4 md:px-8 bg-black">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-500">
            <div className="text-center sm:text-left">
              © 2026 EduTask. All rights reserved. Built with brutal clarity and raw speed.
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 hover:text-gray-300 transition-colors text-[10px] sm:text-xs">
                <span>Made with</span>
                <Heart size={10} className="text-red-600 fill-red-600 animate-bounce" />
                <span>for Unstoppable Doers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border border-gray-800 bg-gray-950 flex items-center justify-center rounded" title="Secure">
                  <Shield size={14} className="text-green-500" />
                </div>
                <div className="w-8 h-8 border border-gray-800 bg-gray-950 flex items-center justify-center rounded" title="SSL">
                  <CreditCard size={14} className="text-[#ea580c]" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </footer>

    </div>
  );
}
