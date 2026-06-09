import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Target, Users, Globe } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';

const team = [
  { name: 'Hafizh Zaki Amrullah', role: 'Project Manager', bg: 'bg-[#1A237E]', initials: 'HZA' },
  { name: 'Muhammad Rizky Cipta Saputra', role: 'Programmer', bg: 'bg-[#FF4D00]', initials: 'MRC' },
  { name: 'Muhammad Sholahudin Yahya', role: 'Programmer', bg: 'bg-[#2E7D32]', initials: 'MSY' },
];

const values = [
  {
    icon: <Zap className="w-8 h-8 stroke-[2.5]" />,
    title: 'RAW SPEED',
    desc: 'Kami percaya produktivitas tidak butuh kompleksitas. Cepat, ringan, dan langsung ke intinya.',
    bg: 'bg-yellow-300',
  },
  {
    icon: <Target className="w-8 h-8 stroke-[2.5]" />,
    title: 'BRUTAL FOCUS',
    desc: 'Tidak ada fitur yang tidak berguna. Setiap elemen dirancang untuk satu tujuan: membuat kamu selesaikan tugas.',
    bg: 'bg-[#FF4D00] text-white',
  },
  {
    icon: <Users className="w-8 h-8 stroke-[2.5]" />,
    title: 'BUILT FOR STUDENTS',
    desc: 'Dirancang dari awal oleh mahasiswa, untuk mahasiswa dan dosen. Kami tahu masalahnya karena kami mengalaminya.',
    bg: 'bg-[#0ea5e9] text-white',
  },
  {
    icon: <Globe className="w-8 h-8 stroke-[2.5]" />,
    title: 'OPEN & HONEST',
    desc: 'Tidak ada biaya tersembunyi, tidak ada dark pattern. Apa yang kamu lihat adalah apa yang kamu dapat.',
    bg: 'bg-[#2E7D32] text-white',
  },
];

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white text-black border-t-8 border-black font-mono">

        {/* Nav */}
        <header className="border-b-4 border-black bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-black tracking-tighter border-4 border-black px-4 py-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:bg-yellow-100 transition-all">
              EduTask
            </Link>
            <Link to="/" className="flex items-center gap-2 font-bold text-sm uppercase hover:underline decoration-4 underline-offset-4">
              <ArrowLeft size={16} strokeWidth={2.5} /> BACK TO HOME
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="border-b-4 border-black py-20 px-4 sm:px-6 lg:px-8 bg-black text-white relative overflow-hidden">
          <div className="absolute top-4 right-8 bg-yellow-300 text-black font-black text-xs px-3 py-1.5 border-2 border-white rotate-[2deg] select-none">
            EST. 2024
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-[#FF4D00] text-white font-bold text-xs uppercase px-3 py-1 border-2 border-white mb-6 rotate-[-1deg]">
              TENTANG KAMI
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase leading-none mb-6 tracking-tight">
              WE BUILD<br />
              <span className="text-yellow-300 underline decoration-wavy decoration-[#FF4D00] underline-offset-8">TOOLS</span><br />
              THAT WORK.
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
              EduTask lahir dari frustrasi nyata tiga mahasiswa PENS: terlalu banyak aplikasi, terlalu sedikit yang benar-benar berguna untuk dunia pendidikan Indonesia.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="border-b-4 border-black py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl font-black uppercase mb-6 tracking-tight">
                CERITA <span className="text-[#FF4D00]">KAMI</span>
              </h2>
              <div className="h-2 w-24 bg-yellow-300 border-2 border-black mb-8" />
              <div className="space-y-4 text-sm leading-relaxed text-gray-700">
                <p>
                  Pada 2024, tiga mahasiswa Politeknik Elektronika Negeri Surabaya (PENS) bosan dengan spreadsheet yang berantakan, grup WhatsApp yang penuh spam tugas, dan aplikasi todo list yang tidak pernah benar-benar cocok dengan ritme kuliah.
                </p>
                <p>
                  Hafizh Zaki Amrullah sebagai Project Manager memimpin visi produk, sementara Muhammad Rizky Cipta Saputra dan Muhammad Sholahudin Yahya membangun sistem dari nol — mulai dari backend Django hingga antarmuka Neo-Brutalist yang kamu lihat sekarang.
                </p>
                <p>
                  Filosofi kami sederhana: <span className="font-black text-black">tool yang baik tidak perlu manual</span>. Kamu buka, kamu paham, kamu produktif. Tidak kurang, tidak lebih.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '3', label: 'Tim Inti' },
                { num: 'PENS', label: 'Politeknik Elektronika Negeri Surabaya' },
                { num: '99.9%', label: 'Uptime' },
                { num: '< 2s', label: 'Load Time' },
              ].map((stat, i) => (
                <div key={i} className={`border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${i % 2 === 0 ? 'bg-yellow-300' : 'bg-black text-white'}`}>
                  <div className="text-4xl font-black mb-1">{stat.num}</div>
                  <div className="text-xs uppercase font-bold tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-b-4 border-black py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
                NILAI-NILAI <span className="text-[#FF4D00]">KAMI</span>
              </h2>
              <div className="h-2 w-24 bg-black border-2 border-black mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <div key={i} className={`${v.bg} border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-[-1px] transition-transform`}>
                  <div className="mb-4">{v.icon}</div>
                  <h3 className="font-black text-lg uppercase mb-2">{v.title}</h3>
                  <p className="text-xs leading-relaxed opacity-80">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="border-b-4 border-black py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
                TIM <span className="text-[#FF4D00]">KAMI</span>
              </h2>
              <div className="h-2 w-24 bg-yellow-300 border-2 border-black mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {team.map((member, i) => (
                <div key={i} className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-1 transition-transform">
                  <div className={`${member.bg} h-32 flex items-center justify-center text-white text-4xl font-black border-b-4 border-black`}>
                    {member.initials}
                  </div>
                  <div className="p-4 bg-white">
                    <div className="font-black text-sm uppercase">{member.name}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase mt-0.5">{member.role}</div>
                    <div className="text-[10px] text-gray-400 mt-1">PENS — Politeknik Elektronika Negeri Surabaya</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-6xl font-black uppercase mb-6 tracking-tight">
              BERGABUNG <span className="text-yellow-300">SEKARANG</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">Jadilah bagian dari ribuan pelajar yang sudah lebih produktif.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-[#FF4D00] text-white font-black py-4 px-10 border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase text-center">
                MULAI GRATIS
              </Link>
              <Link to="/contact" className="bg-transparent text-white font-black py-4 px-10 border-4 border-white hover:bg-white hover:text-black transition-all uppercase text-center">
                HUBUNGI KAMI
              </Link>
            </div>
          </div>
        </section>

        {/* Footer mini */}
        <footer className="border-t-4 border-black py-6 px-4 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-gray-500">
            <span>© 2026 EduTask. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-black uppercase">Privacy</Link>
              <Link to="/contact" className="hover:text-black uppercase">Contact</Link>
              <Link to="/" className="hover:text-black uppercase">Home</Link>
            </div>
          </div>
        </footer>

      </div>
    </PageTransition>
  );
}
