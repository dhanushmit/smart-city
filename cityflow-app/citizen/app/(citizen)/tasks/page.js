'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCitizen } from '@/lib/CitizenContext';
import { apiGetWorkerTasks } from '@/lib/api';
import { CheckCircle2, Clock, AlertCircle, MapPin, Loader2, RefreshCw, Briefcase, X, ChevronRight, Zap, Target, TrendingUp } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smart-city-qc23.onrender.com';

const STATUS_CONFIG = {
  Submitted:   { color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400',  bar: 'w-1/12 bg-slate-300' },
  Assigned:    { color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',   bar: 'w-1/3 bg-blue-500' },
  'In Progress':{ color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500',  bar: 'w-2/3 bg-amber-500' },
  Resolved:    { color: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500', bar: 'w-full bg-emerald-500' },
};

async function apiUpdateStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/api/issues/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status, note: `Status updated to ${status} by field worker.` }),
  });
  return res.json();
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cf_access_cit');
}

export default function TaskConsolePage() {
  const { user } = useCitizen();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('All');

  const loadTasks = async (silent = false) => {
    if (!user?.id) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const data = await apiGetWorkerTasks(user.id);
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(() => loadTasks(true), 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    setUpdating(true);
    try {
      await apiUpdateStatus(taskId, newStatus, getToken());
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      if (selected?.id === taskId) setSelected(prev => ({ ...prev, status: newStatus }));
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  const filteredTasks = tasks.filter(t => filter === 'All' || t.status === filter);
  const counts = {
    All: tasks.length,
    Assigned: tasks.filter(t => t.status === 'Assigned').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Resolved: tasks.filter(t => t.status === 'Resolved').length,
  };

  return (
    <div className="max-w-lg mx-auto pb-32 pt-2 px-4 space-y-8">
      {/* Premium Officer Header */}
      <section className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            <TrendingUp size={12} /> Live Performance
          </p>
          <h2 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none">Task Console</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => loadTasks(true)} disabled={refreshing}
          className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </motion.button>
      </section>

      {/* Stats Summary Chips */}
      <div className="grid grid-cols-3 gap-3">
         <div className="bg-blue-600 rounded-[24px] p-4 text-white shadow-lg shadow-blue-100">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Queue</p>
            <p className="text-xl font-black">{counts.All}</p>
         </div>
         <div className="bg-amber-500 rounded-[24px] p-4 text-white shadow-lg shadow-amber-100">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Active</p>
            <p className="text-xl font-black">{counts['In Progress']}</p>
         </div>
         <div className="bg-emerald-500 rounded-[24px] p-4 text-white shadow-lg shadow-emerald-100">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Solved</p>
            <p className="text-xl font-black">{counts.Resolved}</p>
         </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="bg-slate-100/50 p-1.5 rounded-[24px] flex gap-1 border border-slate-100">
        {['All', 'Assigned', 'In Progress', 'Resolved'].map(f => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-3 px-1 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all
              ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            {f === 'In Progress' ? 'Active' : f}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-blue-600 animate-spin" />
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Fetching Assignments</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-slate-50 border-4 border-dotted border-slate-200 rounded-[40px] p-16 text-center"
        >
          <div className="w-20 h-20 bg-white rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Zap size={32} className="text-blue-200" />
          </div>
          <p className="text-xl font-black text-gray-900 tracking-tight uppercase">No Tasks</p>
          <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-widest">Everything is up to date.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, idx) => {
            const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.Submitted;
            return (
              <motion.div key={task.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[40px] border border-slate-100 shadow-[0_15px_40px_rgba(37,99,235,0.04)] p-5 relative overflow-hidden group"
                onClick={() => setSelected(task)}
              >
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-[32px] bg-slate-50 overflow-hidden flex-shrink-0 border-2 border-white shadow-xl">
                    {task.image_url ? (
                      <img src={`${API_BASE}${task.image_url}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <AlertCircle size={28} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{task.display_id}</span>
                      <span className={`text-[8px] font-[1000] px-3 py-1 rounded-full uppercase tracking-widest ${cfg.color}`}>
                        {task.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 truncate tracking-tight">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tight"><MapPin size={10} className="text-blue-500" />{task.ward}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                       <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} />
                       </div>
                       <ChevronRight size={16} className="text-slate-200" />
                    </div>
                  </div>
                </div>

                {/* Android Native-style Buttons */}
                {task.status !== 'Resolved' && (
                  <div className="flex gap-2 mt-5">
                    {task.status === 'Assigned' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleStatusUpdate(task.id, 'In Progress'); }}
                        disabled={updating}
                        className="flex-1 py-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-[24px] shadow-lg shadow-amber-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Zap size={14} className="fill-white" /> Start Task
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleStatusUpdate(task.id, 'Resolved'); }}
                      disabled={updating}
                      className="flex-1 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-[24px] shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Resolve
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Android Bottom Sheet Detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-md flex items-end justify-center"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-white h-[90vh] rounded-t-[50px] overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
              <div className="overflow-y-auto h-full p-8 pb-36 space-y-8">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-2xl uppercase tracking-[0.2em]">{selected.display_id}</span>
                    <button onClick={() => setSelected(null)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"><X size={20} /></button>
                 </div>

                 {selected.image_url && (
                    <div className="relative">
                       <img src={`${API_BASE}${selected.image_url}`} alt="" className="w-full h-64 object-cover rounded-[40px] border-4 border-white shadow-2xl" />
                       <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">Evidence Photo</div>
                    </div>
                 )}

                 <div>
                    <h3 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-tight mb-3">{selected.title}</h3>
                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                       <p className="text-sm text-gray-500 font-bold leading-relaxed italic">"{selected.description || 'No detailed description.'}"</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {[
                       { label: 'Ward', val: selected.ward, icon: MapPin, col: 'text-blue-600' },
                       { label: 'Category', val: selected.category, icon: Zap, col: 'text-amber-600' },
                       { label: 'Urgency', val: selected.priority, icon: Target, col: selected.priority === 'High' ? 'text-rose-600' : 'text-blue-600' },
                       { label: 'Timestamp', val: new Date(selected.reported_at).toLocaleDateString(), icon: Clock, col: 'text-gray-600' }
                    ].map(item => (
                       <div key={item.label} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-3">
                          <item.icon size={20} className={item.col} />
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                             <p className="font-black text-gray-900 text-sm whitespace-nowrap">{item.val}</p>
                          </div>
                       </div>
                    ))}
                 </div>

                 {selected.location_text && (
                    <div className="bg-blue-600 p-6 rounded-[32px] text-white flex items-start gap-4 shadow-xl shadow-blue-100">
                       <MapPin size={24} className="mt-1" strokeWidth={3} />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70 mb-1">Precise Location</p>
                          <p className="text-lg font-black leading-tight tracking-tight">{selected.location_text}</p>
                       </div>
                    </div>
                 )}
              </div>

              {/* Bottom Sheet Actions */}
              {selected.status !== 'Resolved' && (
                <div className="absolute bottom-0 left-0 w-full p-8 bg-white/90 backdrop-blur-xl border-t border-slate-50 flex gap-4">
                  {selected.status === 'Assigned' && (
                    <button
                      onClick={() => handleStatusUpdate(selected.id, 'In Progress')}
                      disabled={updating}
                      className="flex-1 py-5 bg-amber-500 text-white text-xs font-[1000] uppercase tracking-[0.2em] rounded-[28px] hover:shadow-2xl hover:shadow-amber-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-100"
                    >
                      {updating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="white" />} START
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusUpdate(selected.id, 'Resolved')}
                    disabled={updating}
                    className="flex-1 py-5 bg-emerald-600 text-white text-xs font-[1000] uppercase tracking-[0.2em] rounded-[28px] hover:shadow-2xl hover:shadow-emerald-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100"
                  >
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />} RESOLVE
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
