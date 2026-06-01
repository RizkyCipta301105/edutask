import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 md:py-20 border-b-4 border-black px-4 sm:px-6 lg:px-8 bg-white overflow-hidden relative">
      
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main copy block */}
      <div className="lg:col-span-7 space-y-8 z-10">
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none uppercase tracking-tighter text-black max-w-3xl">
          Organize.<br />
          Execute.<br />
          <span className="text-[#ea580c] relative inline-block underline decoration-yellow-300 decoration-wavy underline-offset-8">
            Conquer.
          </span>
        </h1>

        <p className="text-lg sm:text-2xl font-bold text-gray-800 leading-relaxed max-w-xl">
          The boldest task manager for unstoppable doers. Get things done with raw efficiency.
        </p>

        {/* Benefits lists as badge tags */}
        <div className="flex flex-wrap gap-2 py-2">
          <span className="bg-green-100 text-green-900 border-2 border-black text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
            <CheckCircle size={14} className="stroke-[2.5]" /> Tanpa Kartu Kredit
          </span>
          <span className="bg-blue-100 text-blue-900 border-2 border-black text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
            <CheckCircle size={14} className="stroke-[2.5]" /> Drag & Drop Kolaboratif
          </span>
          <span className="bg-purple-100 text-purple-900 border-2 border-black text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
            <CheckCircle size={14} className="stroke-[2.5]" /> 100% Offline-Friendly
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex pt-2">
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-lg sm:text-2xl font-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-5 hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-center uppercase w-full sm:w-auto"
          >
            <span>MULAI SEKARANG</span>
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform stroke-[3]" />
          </Link>
        </div>

      </div>

      {/* Decorative Illustrator Side Panel */}
      <div className="lg:col-span-5 flex justify-center items-center z-10 relative mt-8 lg:mt-0">
        
        {/* Absolute stylized retro grids & badge frames */}
        <div className="absolute top-[-20px] left-[-20px] bg-yellow-300 w-16 h-16 border-4 border-black font-black text-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none rotate-[-12deg] z-20">
          DO!
        </div>
        
        <div className="absolute bottom-[-10px] right-[-10px] bg-green-400 border-4 border-black px-4 py-2 font-bold text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[6deg] z-20 uppercase">
          PERFORMA RINGAN
        </div>

        <div className="w-full max-w-sm sm:max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 rotate-[1deg] hover:rotate-0 transition-transform duration-300">
          <div className="bg-gray-100 border-b-4 border-black p-3 flex justify-between items-center text-xs font-bold">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-black inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-black inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-black inline-block" />
            </div>
            <div className="text-gray-500 tracking-wider">WORKSPACE_SUPER_PRO.JPG</div>
          </div>
          <img
            alt="Focused developer character mastering digital tasks in brutalist comic illustration art"
            className="w-full h-auto border-t-0 border-black object-contain aspect-square"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmpcmhmo5MAKGDCzfkq4iHmGkQOXWjFzaltNeaYx7PdZPmUibXyIXaRMrOEXxFdlJFkR3Bl8Uk1QeDlWCIejHNnTKFv8HaX9WPu9rpVZOOxabnQj-mpi15AUofBIKJuoE8b9S95_QnHALLsl3eRHvWJ4Klj96crslVpg47ZdeoOocu2Wy7p8P_aNz6pWAUv2i3WJ5Q3yYB7OJh22i2zEOu8if0VPsn7SwERwszIW0iqi4nEIl6oxosEUZRhRYqtAxYX8GyclWcJhg"
            referrerPolicy="no-referrer"
          />
        </div>

      </div>

    </section>
  );
}
