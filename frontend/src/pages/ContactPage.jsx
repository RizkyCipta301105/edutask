import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, BookOpen, Zap, Send, CheckCircle, Loader2 } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import { sendContactMessage } from '../services/contactService';

const topics = [
  { icon: <MessageSquare size={18} strokeWidth={2.5} />, label: 'General Inquiry' },
  { icon: <Zap size={18} strokeWidth={2.5} />, label: 'Technical Support' },
  { icon: <BookOpen size={18} strokeWidth={2.5} />, label: 'Billing & Payments' },
  { icon: <Mail size={18} strokeWidth={2.5} />, label: 'Partnership' },
];

const faqs = [
  {
    q: 'Bagaimana cara bergabung dengan Ruang Edukasi?',
    a: 'Minta kode dari dosen kamu, lalu masuk ke menu "Ruang Edukasi" di dashboard dan ketikkan kode tersebut. Kamu akan langsung bergabung.',
  },
  {
    q: 'Apakah data saya aman di EduTask?',
    a: 'Ya. Semua data dienkripsi dengan TLS 1.3, password di-hash dengan bcrypt, dan kami tidak menjual data apapun ke pihak ketiga.',
  },
  {
    q: 'Bisakah saya upgrade dari Free ke Pro kapan saja?',
    a: 'Tentu. Buka halaman Checkout, pilih plan Pro, dan upgrade aktif seketika. Tidak ada penalti atau biaya tersembunyi.',
  },
  {
    q: 'Bagaimana cara menghapus akun?',
    a: 'Pergi ke Pengaturan Profil → Akun → Hapus Akun. Semua data kamu akan dihapus permanen dalam 30 hari.',
  },
  {
    q: 'Apakah EduTask bisa dipakai offline?',
    a: 'EduTask dirancang offline-friendly — tugas dan jadwal yang sudah di-load bisa dilihat tanpa internet. Sinkronisasi otomatis saat koneksi kembali.',
  },
];

export default function ContactPage() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendContactMessage({ ...form, topic: selectedTopic });
      setSubmitted(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Gagal mengirim pesan. Coba lagi sebentar.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <section className="border-b-4 border-black py-16 px-4 sm:px-6 lg:px-8 bg-[#0ea5e9] text-white relative overflow-hidden">
          <div className="absolute top-4 right-8 bg-yellow-300 text-black font-black text-xs px-3 py-1.5 border-2 border-black rotate-[2deg] select-none">
            RESPON {'<'} 24 JAM
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-black text-white font-black text-xs uppercase px-3 py-1.5 border-2 border-white mb-6">
              HUBUNGI KAMI
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tight mb-4">
              ADA YANG<br />
              <span className="text-yellow-300 underline decoration-wavy decoration-white underline-offset-8">BISA</span><br />
              KAMI BANTU?
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Tim kami siap membantu kamu. Tulis pesan, dan kami akan balas secepat mungkin — biasanya kurang dari satu hari kerja.
            </p>
          </div>
        </section>

        {/* Contact grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-black">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="border-4 border-black bg-green-300 p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                  <CheckCircle className="w-16 h-16 stroke-[2] mx-auto mb-4 text-black" />
                  <h2 className="text-3xl font-black uppercase mb-3">PESAN TERKIRIM!</h2>
                  <p className="text-sm font-bold text-gray-800 mb-6">
                    Kami akan menghubungi kamu dalam 24 jam kerja. Cek inbox email kamu ya.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); setSelectedTopic(''); }}
                    className="bg-black text-white font-black text-xs uppercase px-6 py-3 border-4 border-black hover:bg-[#FF4D00] transition-colors"
                  >
                    KIRIM LAGI
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div className="bg-black text-white px-6 py-4">
                    <h2 className="font-black text-base uppercase tracking-wide">KIRIM PESAN</h2>
                  </div>
                  <div className="bg-white p-6 space-y-5">

                    {/* Topic */}
                    <div>
                      <label className="block text-xs font-black uppercase mb-2 tracking-wide">TOPIK</label>
                      <div className="grid grid-cols-2 gap-2">
                        {topics.map((t) => (
                          <button
                            key={t.label}
                            type="button"
                            onClick={() => setSelectedTopic(t.label)}
                            className={`flex items-center gap-2 text-xs font-black uppercase px-3 py-2.5 border-2 transition-all ${
                              selectedTopic === t.label
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-gray-300 hover:border-black'
                            }`}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase mb-1.5">NAMA</label>
                        <input
                          required
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Nama lengkap"
                          className="w-full border-2 border-black px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] bg-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase mb-1.5">EMAIL</label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="email@kamu.com"
                          className="w-full border-2 border-black px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] bg-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-black uppercase mb-1.5">SUBJEK</label>
                      <input
                        required
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Deskripsi singkat masalahmu"
                        className="w-full border-2 border-black px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] bg-white placeholder-gray-400"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-black uppercase mb-1.5">PESAN</label>
                      <textarea
                        required
                        rows={5}
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Ceritakan detail masalah atau pertanyaanmu..."
                        className="w-full border-2 border-black px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] bg-white resize-none placeholder-gray-400"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="border-2 border-red-500 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 uppercase">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-[#FF4D00] text-white font-black text-sm uppercase py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {loading
                        ? <><Loader2 size={16} className="animate-spin" /> MENGIRIM...</>
                        : <><Send size={16} strokeWidth={2.5} /> KIRIM PESAN</>
                      }
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-yellow-300 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={20} strokeWidth={2.5} />
                  <span className="text-xs font-black uppercase tracking-wider">EMAIL</span>
                </div>
                <a
                  href="mailto:edutask.noreply@gmail.com"
                  className="font-black text-sm underline decoration-2 underline-offset-2 block mb-1"
                >
                  edutask.noreply@gmail.com
                </a>
                <p className="text-xs opacity-70">Untuk semua pertanyaan — support, billing, maupun kemitraan.</p>
              </div>

              <div className="border-4 border-dashed border-gray-400 p-5">
                <div className="text-xs font-black uppercase text-gray-500 mb-1">JAM OPERASIONAL</div>
                <div className="font-black text-sm mb-0.5">Senin – Jumat</div>
                <div className="text-sm text-gray-600">09.00 – 17.00 WIB</div>
                <div className="text-xs text-gray-400 mt-2">Waktu respons rata-rata: &lt; 4 jam</div>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b-4 border-black">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black uppercase tracking-tight mb-2">
                FAQ — <span className="text-[#FF4D00]">PERTANYAAN UMUM</span>
              </h2>
              <div className="h-2 w-24 bg-black border-2 border-black mx-auto" />
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-white text-left"
                  >
                    <span className="font-black text-sm uppercase leading-tight pr-4">{faq.q}</span>
                    <span className="text-2xl font-black shrink-0 text-[#FF4D00]">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="border-t-4 border-black bg-yellow-50 px-5 py-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer mini */}
        <footer className="border-t-4 border-black py-6 px-4 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-gray-500">
            <span>© 2026 EduTask. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-black uppercase">About</Link>
              <Link to="/privacy" className="hover:text-black uppercase">Privacy</Link>
              <Link to="/" className="hover:text-black uppercase">Home</Link>
            </div>
          </div>
        </footer>

      </div>
    </PageTransition>
  );
}
