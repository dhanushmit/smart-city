'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCitizen } from '@/lib/CitizenContext';
import { apiGetWorkerTasks } from '@/lib/api';
import { CheckCircle2, Clock, AlertCircle, MapPin, Loader2, RefreshCw, Briefcase, X, ChevronRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_CONFIG = {
  Submitted:   { color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400',  bar: 'w-1/12 bg-slate-300' },
  Assigned:    { color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',   bar: 'w-1/3 bg-blue-500' },
  'In Progress':{ color: 'bg-yellow-100 text-yellow-700',dot: 'bg-yellow-500', bar: 'w-2/3 bg-yellow-500' },
  Resolved:    { color: 'bg-green-100 text-green-700',   dot: 'bg-green-500',  bar: 'w-full bg-green-500' },
};

async function apiUpdateStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/api/issues/${id}/status/`, {
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
    const interval = setInterval(() => loadTasks(true), 30000);
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
    <div className="max-w-3xl mx-auto pb-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-[900] text-gray-900 tracking-tight">Task Console</h2>
          <p className="text-gray-400 font-semibold mt-1 text-sm flex items-center gap-2">
            <Briefcase size={14} className="text-blue-500" />
            Your active field assignments — Ward: <span className="text-blue-600">{user?.ward}</span>
          </p>
        </div>
        <button
          onClick={() => loadTasks(true)} disabled={refreshing}
          className="flex items-center gap-2 px-5 py-3 bg-blue-50 rounded-2xl text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-100 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Assigned', 'In Progress', 'Resolved'].map(f => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-100 text-gray-400 hover:text-gray-900'}`}
          >
            {f}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-blue-600 animate-spin" />
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Loading assignments...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-slate-50 border-4 border-dotted border-slate-200 rounded-[40px] p-16 text-center"
        >
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={40} className="text-green-300" />
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">All Clear! 🎉</p>
          <p className="text-gray-400 text-sm mt-2 font-semibold">No {filter !== 'All' ? filter.toLowerCase() : ''} tasks found.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, idx) => {
            const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.Submitted;
            return (
              <motion.div key={task.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 cursor-pointer hover:shadow-[0_12px_40px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-all"
                onClick={() => setSelected(task)}
              >
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-[20px] bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    {task.image_url ? (
                      <img src={`${API_BASE}${task.image_url}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <AlertCircle size={28} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">{task.display_id}</span>
                      <span className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {task.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 truncate leading-tight mb-2">{task.title}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 font-bold flex items-center gap-1 uppercase"><MapPin size={11} className="text-blue-500" />{task.ward}</span>
                      <span className="text-xs text-gray-400 font-bold flex items-center gap-1 uppercase"><Clock size={11} className="text-orange-500" />{new Date(task.reported_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} />
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 flex-shrink-0 mt-1" />
                </div>

                {/* Quick Action Buttons */}
                {task.status !== 'Resolved' && (
                  <div className="flex gap-3 mt-5 pt-5 border-t border-slate-50">
                    {task.status === 'Assigned' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleStatusUpdate(task.id, 'In Progress'); }}
                        disabled={updating}
                        className="flex-1 py-3 bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Clock size={14} /> Start Working
                      </button>
                    )}
                    {(task.status === 'Assigned' || task.status === 'In Progress') && (
                      <button
                        onClick={e => { e.stopPropagation(); handleStatusUpdate(task.id, 'Resolved'); }}
                        disabled={updating}
                        className="flex-1 py-3 bg-green-50 border border-green-100 text-green-700 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-green-100 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Mark Resolved
                      </button>
                    )}
                  </div>
                )}
                {task.status === 'Resolved' && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-green-600 text-xs font-black uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Task Completed — Great work!
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full max-w-lg bg-white h-[85vh] rounded-t-[40px] md:rounded-[40px] overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="overflow-y-auto h-full p-8 pb-36 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">{selected.display_id}</span>
                  <button onClick={() => setSelected(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"><X size={18} strokeWidth={3} /></button>
                </div>
                {selected.image_url && (
                  <img src={`${API_BASE}${selected.image_url}`} alt="" className="w-full h-52 object-cover rounded-[28px] border-4 border-white shadow-xl" />
                )}
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{selected.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">"{selected.description || 'No description provided.'}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="font-bold text-gray-900 text-sm">{selected.category}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ward</p>
                    <p className="font-bold text-gray-900 text-sm">{selected.ward}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Priority</p>
                    <p className={`font-bold text-sm ${selected.priority === 'High' ? 'text-red-600' : selected.priority === 'Medium' ? 'text-orange-600' : 'text-green-600'}`}>{selected.priority}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reported</p>
                    <p className="font-bold text-gray-900 text-sm">{new Date(selected.reported_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {selected.location_text && (
                  <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                    <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-semibold text-blue-800">{selected.location_text}</p>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              {selected.status !== 'Resolved' && (
                <div className="absolute bottom-0 left-0 w-full p-6 bg-white/95 backdrop-blur-md border-t border-slate-100 flex gap-3">
                  {selected.status === 'Assigned' && (
                    <button
                      onClick={() => handleStatusUpdate(selected.id, 'In Progress')}
                      disabled={updating}
                      className="flex-1 py-4 bg-yellow-500 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-100"
                    >
                      {updating ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />} Start Working
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusUpdate(selected.id, 'Resolved')}
                    disabled={updating}
                    className="flex-1 py-4 bg-green-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                  >
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Mark Resolved
                  </button>
                </div>
              )}
              {selected.status === 'Resolved' && (
                <div className="absolute bottom-0 left-0 w-full p-6 bg-green-50 border-t border-green-100 flex items-center justify-center gap-3 text-green-700 font-black text-sm uppercase tracking-widest">
                  <CheckCircle2 size={20} /> This task has been resolved!
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
