import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';

const featured = {
  title: 'Kenapa Kami Buat EduTask dari Nol, Bukan Pakai Notion atau Trello',
  excerpt:
    'Jujur aja — kami udah coba semua. Notion terlalu berat, Trello kurang konteks akademik, Google Keep... ya nggak bisa. Jadi kami bikin sendiri. Ini cerita lengkapnya.',
  author: 'Hafizh Zaki Amrullah',
  date: '3 Juni 2026',
  readTime: '7 menit',
  tag: 'PRODUCT',
  bg: 'bg-[#FF4D00]',
};

const posts = [
  {
    title: 'Deadline Besok, Baru Ingat Sekarang — Pengalaman Gue Pakai EduTask Seminggu',
    excerpt: 'Gue bukan orang yang rajin. Tapi notifikasi reminder di EduTask entah kenapa bikin gue nggak bisa pura-pura lupa.',
    author: 'Muhammad Sholahudin Yahya',
    date: '27 Mei 2026',
    readTime: '4 menit',
    tag: 'TIPS',
    bg: 'bg-[#1A237E]',
  },
  {
    title: 'Nulis CSS Border Tebal Itu Menyenangkan: Proses Desain EduTask',
    excerpt: 'Desain pertama kami lebih mirip dashboard bank. Yang sekarang jauh lebih jujur — dan lebih susah dibuat dari yang kelihatannya.',
    author: 'Muhammad Rizky Cipta Saputra',
    date: '19 Mei 2026',
    readTime: '6 menit',
    tag: 'DESIGN',
    bg: 'bg-[#2E7D32]',
  },
  {
    title: 'Fitur Ruang Edukasi: Dari Ide Iseng di Grup WA Jadi Fitur Utama',
    excerpt: 'Awalnya cuma mau bikin "kode join kelas". Eh, ternyata dosen-dosen minta lebih. Ini prosesnya.',
    author: 'Hafizh Zaki Amrullah',
    date: '14 Mei 2026',
    readTime: '8 menit',
    tag: 'TUTORIAL',
    bg: 'bg-[#c2410c]',
  },
  {
    title: 'Changelog Mei 2026: Inbox Baru, Bug Aneh yang Akhirnya Ketemuan, dan Satu Fitur yang Kami Batalkan',
    excerpt: 'Bulan ini cukup gila. Dua sprint, satu rollback, dan satu keputusan sulit soal fitur yang sudah 80% jadi.',
    author: 'Muhammad Rizky Cipta Saputra',
    date: '1 Mei 2026',
    readTime: '5 menit',
    tag: 'CHANGELOG',
    bg: 'bg-black',
  },
  {
    title: 'Belajar Django REST Framework Sambil Bikin EduTask — Ini yang Tidak Diajarkan di Kelas',
    excerpt: 'Serializer, permission class, JWT — semua kedengarannya simpel di dokumentasi. Kenyataannya tidak.',
    author: 'Muhammad Sholahudin Yahya',
    date: '21 April 2026',
    readTime: '9 menit',
    tag: 'INSIGHT',
    bg: 'bg-[#F9A825]',
  },
  {
    title: 'Presentasi Proyek ke Dosen dengan Tampilan yang Tidak Membosankan',
    excerpt: 'EduTask bukan hanya buat mengerjakan tugas. Ini juga buat nunjukin progres ke dosen tanpa drama screenshot WA.',
    author: 'Hafizh Zaki Amrullah',
    date: '9 April 2026',
    readTime: '5 menit',
    tag: 'TIPS',
    bg: 'bg-[#1A237E]',
  },
];

const tagColors = {
  PRODUCT: 'bg-[#FF4D00] text-white',
  TIPS: 'bg-yellow-300 text-black',
  DESIGN: 'bg-green-300 text-black',
  TUTORIAL: 'bg-blue-300 text-black',
  CHANGELOG: 'bg-gray-200 text-black',
  INSIGHT: 'bg-purple-200 text-black',
};

export default function BlogPage() {
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
        <section className="border-b-4 border-black py-14 px-4 sm:px-6 lg:px-8 bg-black text-white">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-yellow-300 text-black font-black text-xs uppercase px-3 py-1.5 border-2 border-white mb-6 rotate-[-1deg]">
              EDUTASK BLOG
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tight mb-4">
              TULISAN<br />
              <span className="text-yellow-300">DARI KAMI.</span><br />
              BUAT KAMU.
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Cerita di balik EduTask, pelajaran dari ngoding tengah malam, dan hal-hal yang nggak sempat masuk dokumentasi.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        <section className="border-b-4 border-black px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">— ARTIKEL PILIHAN</div>
            <div className={`${featured.bg} text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-12 hover:-translate-y-1 transition-transform cursor-pointer`}>
              <div className={`inline-block font-black text-xs uppercase px-2.5 py-1 border-2 border-white mb-4 ${tagColors[featured.tag]}`}>
                {featured.tag}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase leading-tight mb-4 max-w-3xl">
                {featured.title}
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mb-6">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1"><User size={12} /> {featured.author}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {featured.readTime} baca</span>
                <span>{featured.date}</span>
              </div>
            </div>
          </div>
        </section>

        {/* All Posts */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  SEMUA <span className="text-[#FF4D00]">ARTIKEL</span>
                </h2>
                <div className="h-1.5 w-16 bg-yellow-300 border-2 border-black mt-2" />
              </div>
              {/* Tags filter — visual only */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(tagColors).map(([tag, cls]) => (
                  <span key={tag} className={`${cls} border-2 border-black text-xs font-black px-2.5 py-0.5 cursor-pointer hover:opacity-80 transition-opacity`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <div key={i} className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-1 hover:translate-x-[-1px] transition-transform cursor-pointer flex flex-col">
                  <div className={`${post.bg} text-white p-5 border-b-4 border-black`}>
                    <span className={`inline-block font-black text-xs uppercase px-2 py-0.5 border border-white mb-3 ${tagColors[post.tag]}`}>
                      <Tag size={10} className="inline mr-1" />{post.tag}
                    </span>
                    <h3 className="font-black text-base sm:text-lg uppercase leading-tight">{post.title}</h3>
                  </div>
                  <div className="bg-white p-5 flex flex-col flex-grow">
                    <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-grow">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 border-t-2 border-gray-100 pt-3">
                      <span className="flex items-center gap-1"><User size={11} /> {post.author}</span>
                      <span className="flex items-center gap-1 ml-auto"><Clock size={11} /> {post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more placeholder */}
            <div className="mt-10 text-center">
              <button className="bg-black text-white font-black text-sm uppercase px-10 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                MUAT LEBIH BANYAK
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="border-t-4 border-black py-14 px-4 sm:px-6 lg:px-8 bg-yellow-300">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-black uppercase mb-4 tracking-tight">
              MAU TAHU<br />DULUAN?
            </h2>
            <p className="text-sm font-bold text-gray-800 mb-6">Kasih email kamu, nanti kami kabarin kalau ada tulisan baru. Nggak bakal spam, janji.</p>
            <div className="flex gap-0 max-w-md mx-auto">
              <input
                type="email"
                placeholder="email@kamu.com"
                className="flex-grow border-4 border-r-0 border-black px-4 py-3 text-sm font-bold focus:outline-none bg-white placeholder-gray-400 uppercase"
              />
              <button className="bg-black text-white font-black text-xs uppercase px-6 py-3 border-4 border-black hover:bg-[#FF4D00] transition-colors shrink-0">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </section>

        {/* Footer mini */}
        <footer className="border-t-4 border-black py-6 px-4 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-gray-500">
            <span>© 2026 EduTask. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-black uppercase">About</Link>
              <Link to="/contact" className="hover:text-black uppercase">Contact</Link>
              <Link to="/" className="hover:text-black uppercase">Home</Link>
            </div>
          </div>
        </footer>

      </div>
    </PageTransition>
  );
}
