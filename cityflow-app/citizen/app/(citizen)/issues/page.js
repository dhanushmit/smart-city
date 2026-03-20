'use client';
import { useState, useEffect } from 'react';
import { apiGetMyIssues, apiDeleteIssue } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, MapPin, Search, ChevronRight, X, MessageCircle, Send, Trash2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smart-city-qc23.onrender.com';

export default function MyIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const d = await apiGetMyIssues();
      setIssues(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await apiDeleteIssue(id);
      setIssues(prev => prev.filter(i => i.id !== id));
      setSelected(null);
    } catch (e) { alert(e.message); }
  };

  const filtered = issues.filter(i => filter === 'All' || i.status === filter);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Tracked Issues</h2>
           <p className="text-gray-400 font-medium mt-1">Status of your {issues.length} reported concerns.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-3xl w-fit border border-slate-50">
           {['All', 'Submitted', 'In Progress', 'Resolved'].map(s => (
             <button
               key={s} onClick={() => setFilter(s)}
               className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                 ${filter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
             >{s}</button>
           ))}
        </div>
      </header>

      <div className="space-y-4">
        {filtered.map((issue, idx) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * idx }}
            onClick={() => setSelected(issue)}
            className="bg-white p-6 rounded-[36px] border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
          >
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[20px] bg-slate-50 flex-shrink-0 border border-slate-100 overflow-hidden flex items-center justify-center">
                   {issue.image_url ? (
                     <img src={`${API_BASE}${issue.image_url}`} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <AlertCircle size={24} className="text-slate-300" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest">{issue.display_id}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full
                         ${issue.status === 'Resolved' ? 'bg-green-100 text-green-600' :
                           issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                           'bg-slate-100 text-slate-500'}`}
                      >{issue.status}</span>
                   </div>
                   <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{issue.title}</h4>
                   <div className="flex items-center gap-4 mt-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> {issue.ward}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {new Date(issue.reported_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                   </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <ChevronRight size={20} />
                </div>
             </div>
          </motion.div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center opacity-40">
             <Clock size={48} className="mx-auto mb-4" />
             <p className="font-black text-xs uppercase tracking-widest">No matching issues found</p>
          </div>
        )}
      </div>

      {/* Details Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setSelected(null)}
          >
             <motion.div
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
               className="w-full max-w-lg bg-white h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[40px] md:rounded-[40px] overflow-hidden shadow-2xl relative"
               onClick={e => e.stopPropagation()}
             >
                <div className="overflow-y-auto h-full p-8 space-y-8 pb-32">
                   <div className="flex items-center justify-between">
                      <div>
                         <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{selected.display_id}</span>
                         <h3 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">{selected.title}</h3>
                      </div>
                      <button onClick={() => setSelected(null)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-gray-900 transition-colors"><X size={20} strokeWidth={3} /></button>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                         <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selected.status === 'Resolved' ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <p className="text-sm font-bold text-gray-900">{selected.status}</p>
                         </div>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Priority</p>
                         <p className={`text-sm font-bold ${selected.priority === 'High' ? 'text-red-600' : 'text-blue-600'}`}>{selected.priority}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Evidence & Location</p>
                      <div className="w-full h-56 rounded-[32px] overflow-hidden shadow-xl border-4 border-white">
                         <img src={`${API_BASE}${selected.image_url}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl text-xs font-bold text-gray-600">
                         <MapPin size={16} className="text-blue-600" /> {selected.location_text || selected.ward}
                      </div>
                   </div>

                   {selected.description && (
                     <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 italic text-sm text-gray-600 leading-relaxed">
                        "{selected.description}"
                     </div>
                   )}

                   {/* Timeline visualization */}
                   <div className="space-y-6">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Live Progress</p>
                      <div className="relative pl-8 space-y-8">
                         <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />
                         {(selected.timeline || []).map((t, tidx) => (
                           <div key={t.id} className="relative">
                              <div className="absolute -left-8 top-1 w-6 h-6 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center shadow-lg shadow-blue-100 z-10" />
                              <div>
                                 <p className="text-sm font-black text-gray-900">{t.status}</p>
                                 <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mt-1">{new Date(t.changed_at).toLocaleString('en-IN')}</p>
                                 {t.note && <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">{t.note}</p>}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 bg-white/95 backdrop-blur-md border-t border-slate-50 flex gap-3">
                    <button className="flex-1 btn-primary !rounded-2xl flex items-center justify-center gap-2" onClick={() => setSelected(null)}>Got it</button>
                    {selected.status === 'Submitted' && (
                       <button
                         className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center"
                         onClick={() => handleDelete(selected.id)}
                       >
                         <Trash2 size={20} />
                       </button>
                    )}
                 </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
