import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, Zap, BookOpen, Monitor, Code, Pen, Megaphone, HeadphonesIcon, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';

const openings = [
  {
    title: 'Senior Frontend Engineer',
    dept: 'ENGINEERING',
    type: 'FULL-TIME',
    loc: 'Remote / Surabaya',
    bg: 'bg-[#1A237E]',
    icon: <Monitor size={20} strokeWidth={2.5} />,
    desc: 'Bangun antarmuka Neo-Brutalist dengan React & Tailwind. Kamu suka border tebal dan shadow keras? Ini tempat kamu.',
    tags: ['React', 'TypeScript', 'Tailwind'],
  },
  {
    title: 'Backend Engineer (Python/Django)',
    dept: 'ENGINEERING',
    type: 'FULL-TIME',
    loc: 'Remote / Surabaya',
    bg: 'bg-[#2E7D32]',
    icon: <Code size={20} strokeWidth={2.5} />,
    desc: 'API yang cepat, aman, dan skalabel. Kamu handle ratusan ribu request sehari sambil minum kopi.',
    tags: ['Python', 'Django', 'PostgreSQL'],
  },
  {
    title: 'Product Designer',
    dept: 'DESIGN',
    type: 'FULL-TIME',
    loc: 'Remote',
    bg: 'bg-[#FF4D00]',
    icon: <Pen size={20} strokeWidth={2.5} />,
    desc: 'Desain yang berani dan intuitif. Tidak takut keluar dari template Dribbble. Figma adalah kanvasmu.',
    tags: ['Figma', 'UX Research', 'Design Systems'],
  },
  {
    title: 'Growth & Marketing Intern',
    dept: 'MARKETING',
    type: 'INTERNSHIP',
    loc: 'Surabaya / Hybrid',
    bg: 'bg-[#F9A825]',
    icon: <Megaphone size={20} strokeWidth={2.5} />,
    desc: 'Bantu EduTask masuk ke setiap kampus Indonesia. Data-driven, kreatif, dan tidak takut coba hal baru.',
    tags: ['Social Media', 'Content', 'Analytics'],
  },
  {
    title: 'Customer Success Specialist',
    dept: 'SUPPORT',
    type: 'PART-TIME',
    loc: 'Remote',
    bg: 'bg-black',
    icon: <HeadphonesIcon size={20} strokeWidth={2.5} />,
    desc: 'Kamu wajah EduTask. Pastikan setiap pengguna puas dan masalah mereka selesai sebelum mereka sadar ada masalah.',
    tags: ['Communication', 'Problem Solving', 'Empathy'],
  },
];

const perks = [
  { icon: <MapPin size={20} strokeWidth={2.5} />, title: 'Remote First', desc: 'Kerja dari mana saja, selama ada koneksi dan komitmen.' },
  { icon: <BookOpen size={20} strokeWidth={2.5} />, title: 'Learning Budget', desc: 'Rp 2 juta/bulan untuk kursus, buku, atau konferensi.' },
  { icon: <Monitor size={20} strokeWidth={2.5} />, title: 'Equipment Allowance', desc: 'Setup kerja impian, kami bantu biayai.' },
  { icon: <Zap size={20} strokeWidth={2.5} />, title: 'Health Coverage', desc: 'BPJS + asuransi swasta untuk kamu dan keluarga.' },
  { icon: <Clock size={20} strokeWidth={2.5} />, title: 'Flexible Hours', desc: 'Hasil yang penting, bukan jam duduk di kursi.' },
  { icon: <Briefcase size={20} strokeWidth={2.5} />, title: 'Equity Options', desc: 'Tumbuh bersama perusahaan. Kamu ikut memiliki EduTask.' },
];

const steps = [
  { num: '01', icon: <Briefcase size={22} strokeWidth={2.5} />, label: 'Kirim Lamaran' },
  { num: '02', icon: <HeadphonesIcon size={22} strokeWidth={2.5} />, label: 'Interview Awal' },
  { num: '03', icon: <Code size={22} strokeWidth={2.5} />, label: 'Technical Test' },
  { num: '04', icon: <CheckCircle2 size={22} strokeWidth={2.5} />, label: 'Welcome Onboard' },
];

export default function CareersPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white text-black border-t-8 border-black font-mono">

        {/* Nav */}
        <header className="border-b-4 border-black bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-black tracking-tighter border-4 border-black px-4 py-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:bg-yellow-100 transition-all"
            >
              EduTask
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 font-black text-sm uppercase border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-all"
            >
              <ArrowLeft size={14} strokeWidth={3} /> HOME
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="border-b-4 border-black bg-yellow-300 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-black rotate-12 opacity-5 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-black text-yellow-300 font-black text-xs uppercase px-3 py-1.5 border-2 border-black rotate-[-1deg]">
                WE'RE HIRING
              </span>
              <span className="bg-white text-black font-black text-xs uppercase px-3 py-1.5 border-2 border-black">
                {openings.length} POSISI TERBUKA
              </span>
              <span className="bg-[#FF4D00] text-white font-black text-xs uppercase px-3 py-1.5 border-2 border-black">
                REMOTE FRIENDLY
              </span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black uppercase leading-none tracking-tight text-black mb-6">
              BUILD THE<br />
              FUTURE<br />
              <span className="text-[#FF4D00] underline decoration-wavy decoration-black underline-offset-8">
                WITH US.
              </span>
            </h1>
            <p className="text-gray-800 text-lg sm:text-xl font-bold max-w-2xl leading-relaxed">
              Kami cari orang-orang yang tidak puas dengan status quo — yang mau bikin tools pendidikan Indonesia jadi kelas dunia.
            </p>
          </div>
        </section>

        {/* Perks */}
        <section className="border-b-4 border-black bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-2">
                KENAPA <span className="text-yellow-300">EDUTASK?</span>
              </h2>
              <div className="h-2 w-20 bg-[#FF4D00] border-2 border-white" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {perks.map((perk, i) => (
                <div
                  key={i}
                  className="border-2 border-gray-700 p-6 hover:border-yellow-300 hover:-translate-y-0.5 transition-all group"
                >
                  <div className="text-yellow-300 mb-3">{perk.icon}</div>
                  <div className="font-black text-sm uppercase mb-2 text-yellow-300 group-hover:text-white transition-colors">
                    {perk.title}
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">{perk.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Openings */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-2">
                POSISI <span className="text-[#FF4D00]">TERBUKA</span>
              </h2>
              <div className="h-2 w-20 bg-yellow-300 border-2 border-black" />
            </div>

            <div className="space-y-5">
              {openings.map((job, i) => (
                <div
                  key={i}
                  className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className={`${job.bg} text-white px-6 py-3 flex items-center justify-between flex-wrap gap-2`}>
                    <div className="flex items-center gap-3">
                      {job.icon}
                      <span className="text-xs font-black uppercase tracking-wider">{job.dept}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 border border-white/30">
                        <Clock size={11} strokeWidth={2.5} /> {job.type}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 border border-white/30">
                        <MapPin size={11} strokeWidth={2.5} /> {job.loc}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-1">{job.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed max-w-lg mb-3">{job.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, j) => (
                          <span key={j} className="bg-gray-50 border-2 border-black text-black text-xs font-black px-2.5 py-0.5 uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a
                      href="mailto:careers@edutask.id"
                      className="shrink-0 bg-black text-white font-black text-xs uppercase px-6 py-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center"
                    >
                      APPLY NOW →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Open application */}
            <div className="mt-12 border-4 border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <Briefcase size={40} strokeWidth={1.5} className="mx-auto mb-4 text-gray-400" />
              <h3 className="font-black text-2xl uppercase mb-2">Tidak Ada yang Cocok?</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
                Kirim CV kamu tetap. Siapa tahu ada peluang yang belum kami posting minggu ini.
              </p>
              <a
                href="mailto:careers@edutask.id"
                className="inline-block bg-yellow-300 text-black font-black text-sm uppercase px-10 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                KIRIM OPEN APPLICATION
              </a>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="border-t-4 border-black bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black uppercase mb-10 tracking-tight">
              PROSES <span className="text-yellow-300">REKRUTMEN</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {steps.map((s) => (
                <div key={s.num} className="border-2 border-gray-700 p-5">
                  <div className="text-yellow-300 font-black text-xs uppercase mb-3 opacity-60">{s.num}</div>
                  <div className="text-yellow-300 mb-2">{s.icon}</div>
                  <div className="font-black text-sm uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer mini */}
        <footer className="border-t-4 border-black py-6 px-4 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <span>© 2026 EduTask. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-black uppercase font-bold">About</Link>
              <Link to="/contact" className="hover:text-black uppercase font-bold">Contact</Link>
              <Link to="/" className="hover:text-black uppercase font-bold">Home</Link>
            </div>
          </div>
        </footer>

      </div>
    </PageTransition>
  );
}
