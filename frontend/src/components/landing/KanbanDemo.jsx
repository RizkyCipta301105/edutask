import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Edit3, RotateCcw } from 'lucide-react';

const defaultTasks = [
  { id: 1, title: 'Complete Project Proposal', priority: 'URGENT', context: 'WORK', date: 'Oct 26', col: 'todo' },
  { id: 2, title: 'Review Design Mockups', priority: 'URGENT', context: 'DESIGN', date: 'Oct 26', col: 'todo' },
  { id: 3, title: 'Send Email Update', priority: 'LOW', context: 'PERSONAL', date: 'Oct 28', col: 'todo' },
  { id: 4, title: 'Team Sync Meeting', priority: 'MEDIUM', context: 'WORK', date: 'Oct 29', col: 'todo' },
];

const getPriorityColor = (p) => {
  switch (p) {
    case 'URGENT': return 'bg-red-500 text-white';
    case 'MEDIUM': return 'bg-yellow-400 text-black';
    case 'LOW':    return 'bg-blue-500 text-white';
    default:       return 'bg-gray-300 text-black';
  }
};

const getContextColor = (c) => {
  switch (c) {
    case 'WORK':     return 'bg-gray-200 text-black';
    case 'DESIGN':   return 'bg-pink-100 text-black';
    case 'PERSONAL': return 'bg-purple-100 text-black';
    case 'STUDY':    return 'bg-blue-100 text-black';
    case 'CODE':     return 'bg-emerald-100 text-black';
    default:         return 'bg-gray-100 text-black';
  }
};

export default function KanbanDemo() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('landing_demo_tasks');
      return saved ? JSON.parse(saved) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [context, setContext] = useState('WORK');
  const [column, setColumn] = useState('todo');

  useEffect(() => {
    localStorage.setItem('landing_demo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleReset = () => {
    if (window.confirm('Reset demo ke tugas awal?')) setTasks(defaultTasks);
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, col) => { e.preventDefault(); setDragOverColumn(col); };
  const handleDragLeave = () => setDragOverColumn(null);
  const handleDrop = (e, targetCol) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = parseInt(e.dataTransfer.getData('text/plain'), 10);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, col: targetCol } : t));
  };

  const moveTask = (task, direction) => {
    let nextCol = task.col;
    if (direction === 'forward') {
      if (task.col === 'todo') nextCol = 'inprogress';
      else if (task.col === 'inprogress') nextCol = 'done';
    } else {
      if (task.col === 'done') nextCol = 'inprogress';
      else if (task.col === 'inprogress') nextCol = 'todo';
    }
    setTasks(tasks.map(t => t.id === task.id ? { ...t, col: nextCol } : t));
  };

  const handleOpenAdd = (col) => {
    setEditingTask(null); setTitle(''); setPriority('MEDIUM'); setContext('WORK'); setColumn(col);
    setIsModalOpen(true);
  };
  const handleOpenEdit = (task) => {
    setEditingTask(task); setTitle(task.title); setPriority(task.priority);
    setContext(task.context); setColumn(task.col); setIsModalOpen(true);
  };
  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title, priority, context, col: column } : t));
    } else {
      setTasks([...tasks, {
        id: Date.now(), title, priority, context, col: column,
        date: new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
      }]);
    }
    setIsModalOpen(false);
  };
  const handleDelete = (id) => { setTasks(tasks.filter(t => t.id !== id)); setIsModalOpen(false); };

  const todoTasks       = tasks.filter(t => t.col === 'todo');
  const inprogressTasks = tasks.filter(t => t.col === 'inprogress');
  const doneTasks       = tasks.filter(t => t.col === 'done');

  const columns = [
    { key: 'todo',       label: 'TO DO',       headerBg: 'bg-[#1A237E]', dot: 'bg-red-500 animate-pulse',   items: todoTasks },
    { key: 'inprogress', label: 'IN PROGRESS', headerBg: 'bg-[#FF4D00]', dot: 'bg-amber-300 animate-pulse', items: inprogressTasks },
    { key: 'done',       label: 'DONE',        headerBg: 'bg-[#2E7D32]', dot: 'bg-green-400',               items: doneTasks },
  ];

  return (
    <section id="demo-section" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b-4 border-black">

      {/* Heading */}
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase text-black tracking-tight leading-none">
          SEE IT IN ACTION.
        </h2>
        <div className="h-1.5 w-40 bg-purple-500 border-2 border-black mx-auto mb-4" />
        <p className="text-lg sm:text-xl font-bold text-gray-800">
          Uji Coba Demo Live — Tanpa Registrasi.
        </p>
      </div>

      {/* Board */}
      <div className="max-w-6xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-6 lg:p-8 relative">

        {/* Reset button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-yellow-100 hover:bg-yellow-200 text-black text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
          >
            <RotateCcw size={12} />
            RESET DEMO
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-8">
          {columns.map(({ key, label, headerBg, dot, items }) => (
            <div
              key={key}
              onDragOver={e => handleDragOver(e, key)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, key)}
              className={`flex flex-col border-4 border-black min-h-[500px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ${
                dragOverColumn === key ? 'bg-amber-50 border-[#ea580c] scale-[1.01]' : 'bg-[#F9FAF6]'
              }`}
            >
              {/* Column header */}
              <div className={`p-4 border-b-4 border-black ${headerBg} text-white flex justify-between items-center`}>
                <h3 className="text-xl font-black uppercase flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full border-2 border-white inline-block ${dot}`} />
                  {label}
                </h3>
                <span className="bg-black text-white px-2.5 py-0.5 border-2 border-white text-xs font-bold">
                  {items.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-grow p-4 space-y-4 overflow-y-auto max-h-[500px]">
                {items.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-6 border-2 border-dashed border-gray-400 text-xs text-gray-500">
                    {key === 'todo' && 'Tidak ada tugas. Tambahkan sekarang!'}
                    {key === 'inprogress' && 'Pindahkan tugas dari TO DO.'}
                    {key === 'done' && 'Selesaikan tugas-tugas Anda!'}
                  </div>
                ) : (
                  items.map(t => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={e => handleDragStart(e, t.id)}
                      className={`bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all relative group select-none cursor-grab active:cursor-grabbing ${
                        key === 'done' ? 'opacity-70 line-through' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        {key !== 'todo' && (
                          <button onClick={() => moveTask(t, 'backward')} className="bg-gray-200 hover:bg-gray-300 p-1 border-2 border-black cursor-pointer shrink-0" title="Mundur">
                            <ArrowLeft size={14} className="stroke-[3]" />
                          </button>
                        )}
                        <div
                          onClick={() => handleOpenEdit(t)}
                          className="flex-grow font-bold text-sm text-black cursor-pointer group-hover:text-blue-700 hover:underline"
                        >
                          {t.title}
                        </div>
                        {key !== 'done' ? (
                          <button onClick={() => moveTask(t, 'forward')} className={`p-1 border-2 border-black cursor-pointer shrink-0 ${key === 'todo' ? 'bg-yellow-300 hover:bg-yellow-400' : 'bg-green-400 hover:bg-green-500'}`} title="Maju">
                            <ArrowRight size={14} className="stroke-[3]" />
                          </button>
                        ) : (
                          <button onClick={() => handleDelete(t.id)} className="bg-red-200 hover:bg-red-400 p-1 border-2 border-black text-red-900 cursor-pointer shrink-0">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-[10px] font-bold mb-2">
                        <span className={`${getPriorityColor(t.priority)} px-2 py-0.5 border border-black`}>{t.priority}</span>
                        <span className={`${getContextColor(t.context)} px-2 py-0.5 border border-black`}>{t.context}</span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                        <span>Tanggal: {t.date}</span>
                        <button onClick={() => handleOpenEdit(t)} className="flex items-center gap-0.5 hover:text-[#FF4D00] opacity-60 group-hover:opacity-100 cursor-pointer">
                          <Edit3 size={10} /> EDIT
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add button */}
              <div className="p-4 border-t-4 border-black bg-white mt-auto">
                <button
                  onClick={() => handleOpenAdd(key)}
                  className="w-full bg-white hover:bg-gray-100 text-black font-black py-3 border-2 border-black flex justify-center items-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus size={18} className="stroke-[2.5]" /> TAMBAH TUGAS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-full relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 border-2 border-black w-8 h-8 font-black flex items-center justify-center cursor-pointer">
              ✕
            </button>

            <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-3 mb-6">
              {editingTask ? 'EDIT TUGAS' : 'BUAT TUGAS BARU'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Judul Tugas</label>
                <input
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Belajar Pemrograman React"
                  className="w-full border-2 border-black bg-gray-50 p-3 font-bold focus:bg-yellow-50 focus:outline-none w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Prioritas</label>
                <div className="grid grid-cols-3 gap-2">
                  {['URGENT', 'MEDIUM', 'LOW'].map(p => (
                    <button type="button" key={p} onClick={() => setPriority(p)}
                      className={`py-2 text-xs font-bold border-2 border-black cursor-pointer transition-all ${priority === p ? getPriorityColor(p) + ' shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-[2px]' : 'bg-white text-black'}`}
                    >{p}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {['WORK', 'DESIGN', 'PERSONAL', 'STUDY', 'CODE'].map(c => (
                    <button type="button" key={c} onClick={() => setContext(c)}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-black cursor-pointer transition-all ${context === c ? getContextColor(c) + ' border-blue-600 -translate-y-[1px]' : 'bg-white text-black'}`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Kolom</label>
                <select value={column} onChange={e => setColumn(e.target.value)} className="w-full border-2 border-black bg-gray-50 p-2 text-sm">
                  <option value="todo">TO DO</option>
                  <option value="inprogress">IN PROGRESS</option>
                  <option value="done">DONE</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-dashed border-gray-400">
                {editingTask && (
                  <button type="button" onClick={() => handleDelete(editingTask.id)}
                    className="flex-1 bg-red-500 text-white font-black py-3 border-2 border-black hover:bg-red-600 uppercase cursor-pointer">
                    Hapus
                  </button>
                )}
                <button type="submit" className="flex-1 bg-green-500 text-white font-black py-3 border-2 border-black hover:bg-green-600 uppercase cursor-pointer">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
