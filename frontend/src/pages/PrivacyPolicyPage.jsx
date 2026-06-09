import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Settings, Share2, UserCheck, Lock, Cookie, Check, Mail } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';

const sections = [
  {
    num: '01',
    icon: <Database size={22} strokeWidth={2.5} />,
    title: 'DATA YANG KAMI KUMPULKAN',
    color: 'bg-[#1A237E]',
    content: [
      {
        sub: 'Informasi Akun',
        text: 'Ketika kamu mendaftar, kami kumpulkan nama, email, dan peran (mahasiswa/dosen/umum). Tidak lebih dari itu.',
      },
      {
        sub: 'Data Penggunaan',
        text: 'Aktivitas dalam app (tugas, jadwal, pesan) digunakan semata-mata untuk menjalankan layanan. Tidak dijual ke siapapun.',
      },
      {
        sub: 'Data Teknis',
        text: 'Log server standar: IP, tipe browser, waktu akses. Hanya untuk keamanan dan debugging.',
      },
    ],
  },
  {
    num: '02',
    icon: <Settings size={22} strokeWidth={2.5} />,
    title: 'BAGAIMANA KAMI MENGGUNAKAN DATA',
    color: 'bg-[#2E7D32]',
    content: [
      {
        sub: 'Menjalankan Layanan',
        text: 'Data kamu dipakai untuk fitur EduTask: manajemen tugas, sinkronisasi jadwal, dan komunikasi antar pengguna.',
      },
      {
        sub: 'Notifikasi & Email',
        text: 'Hanya email sistem penting: verifikasi akun, reset password. Tidak ada newsletter yang kamu tidak minta.',
      },
      {
        sub: 'Keamanan',
        text: 'Mendeteksi dan mencegah penyalahgunaan, akses tidak sah, dan ancaman lainnya.',
      },
    ],
  },
  {
    num: '03',
    icon: <Share2 size={22} strokeWidth={2.5} />,
    title: 'BERBAGI DATA',
    color: 'bg-[#FF4D00]',
    content: [
      {
        sub: 'Tidak Dijual',
        text: 'Kami tidak menjual, menyewakan, atau menukar data pribadi kamu ke pihak manapun untuk tujuan komersial. Titik.',
      },
      {
        sub: 'Penyedia Infrastruktur',
        text: 'Layanan server dan email terpercaya yang terikat perjanjian kerahasiaan ketat. Mereka hanya akses data seperlunya.',
      },
      {
        sub: 'Kewajiban Hukum',
        text: 'Hanya jika diwajibkan hukum Indonesia. Kami akan beritahu kamu terlebih dahulu jika memungkinkan.',
      },
    ],
  },
  {
    num: '04',
    icon: <UserCheck size={22} strokeWidth={2.5} />,
    title: 'HAK-HAK KAMU',
    color: 'bg-[#c2410c]',
    content: [
      {
        sub: 'Akses & Koreksi',
        text: 'Lihat dan perbarui data pribadi kapan saja lewat halaman Profil. Tidak perlu kontak support.',
      },
      {
        sub: 'Hapus Akun',
        text: 'Hapus akun dan semua data permanen dari pengaturan akun. Data hilang dalam 30 hari.',
      },
      {
        sub: 'Ekspor Data',
        text: 'Minta ekspor semua data dalam format machine-readable. Email ke edutask.noreply@gmail.com.',
      },
    ],
  },
  {
    num: '05',
    icon: <Lock size={22} strokeWidth={2.5} />,
    title: 'KEAMANAN DATA',
    color: 'bg-black',
    content: [
      {
        sub: 'Enkripsi',
        text: 'Semua data dalam transit dienkripsi TLS 1.3. Password di-hash bcrypt — kami tidak pernah menyimpan teks biasa.',
      },
      {
        sub: 'Akses Terbatas',
        text: 'Hanya tim inti yang akses database produksi, dengan autentikasi multi-faktor wajib.',
      },
      {
        sub: 'Audit Rutin',
        text: 'Review keamanan reguler. Laporan kerentanan dari komunitas kami respons serius.',
      },
    ],
  },
  {
    num: '06',
    icon: <Cookie size={22} strokeWidth={2.5} />,
    title: 'COOKIES',
    color: 'bg-[#F9A825]',
    content: [
      {
        sub: 'Yang Kami Pakai',
        text: 'Hanya cookie esensial untuk sesi login dan preferensi tampilan. Tidak ada tracker pihak ketiga, tidak ada pixel iklan.',
      },
      {
        sub: 'Kontrol Penuh',
        text: 'Hapus cookie dari browser kapan saja. Menghapus cookie sesi berarti kamu perlu login ulang.',
      },
    ],
  },
];

const tldr = [
  'Kami tidak jual data kamu ke siapapun',
  'Kamu bisa hapus akun dan data kapan saja',
  'Password dienkripsi, tidak pernah kami baca',
  'Hanya email penting, tidak ada spam',
  'Tidak ada cookie tracking pihak ketiga',
  'Kamu bisa edit atau ekspor datamu sendiri',
];

export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState(null);

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
        <section className="border-b-4 border-black bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-400 border-4 border-white flex items-center justify-center shrink-0">
                <Shield className="w-8 h-8 stroke-[2.5] text-black" />
              </div>
              <span className="bg-green-400 text-black font-black text-xs uppercase px-3 py-1.5 border-2 border-white">
                PRIVASI ADALAH HAK DASAR
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tight mb-4">
              KEBIJAKAN<br />
              <span className="text-green-400">PRIVASI</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-lg">
              Terakhir diperbarui: 1 Januari 2026 — Ditulis dalam bahasa manusia, bukan bahasa pengacara.
            </p>
          </div>
        </section>

        {/* TL;DR */}
        <section className="border-b-4 border-black px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-300 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-5">
                <Shield size={22} strokeWidth={2.5} />
                <h2 className="font-black text-xl uppercase">TL;DR — Ringkasan Singkat</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tldr.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 font-bold text-sm bg-white/70 border-2 border-black px-4 py-2.5">
                    <Check size={14} strokeWidth={3} className="shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sections accordion */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {sections.map((section, idx) => (
              <div
                key={section.num}
                className="border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
              >
                <button
                  onClick={() => setOpenSection(openSection === idx ? null : idx)}
                  className={`w-full ${section.color} text-white px-6 py-4 flex items-center justify-between gap-4 text-left hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">{section.icon}</div>
                    <div>
                      <span className="text-yellow-300 font-black text-xs opacity-70 block">{section.num}</span>
                      <span className="font-black text-sm sm:text-base uppercase tracking-tight">{section.title}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black shrink-0 leading-none">
                    {openSection === idx ? '−' : '+'}
                  </span>
                </button>

                {openSection === idx && (
                  <div className="bg-white divide-y-2 divide-gray-100">
                    {section.content.map((item, i) => (
                      <div key={i} className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-1">
                          <span className="text-xs font-black uppercase text-[#FF4D00] border-b-2 border-[#FF4D00] pb-0.5">
                            {item.sub}
                          </span>
                        </div>
                        <p className="sm:col-span-3 text-sm leading-relaxed text-gray-700">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="border-t-4 border-black bg-gray-50 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Mail size={40} strokeWidth={1.5} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-3xl font-black uppercase mb-3">Ada Pertanyaan?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Hubungi kami langsung soal privasi, permintaan data, atau penghapusan akun.
            </p>
            <a
              href="mailto:edutask.noreply@gmail.com"
              className="inline-block bg-black text-white font-black text-sm uppercase px-10 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:bg-[#FF4D00] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              edutask.noreply@gmail.com →
            </a>
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
