'use client';
import { useState, useEffect } from 'react';
import { apiGetPublicIssues, apiUpvoteIssue, apiAddComment } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageCircle, MapPin, Search, ChevronDown, CheckCircle2, AlertCircle, X, Send, User, Loader2, RefreshCw } from 'lucide-react';
import { useCitizen } from '@/lib/CitizenContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const FeedCard = ({ issue, onUpdate }) => {
  const { user } = useCitizen();
  const [upvoting, setUpvoting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (upvoting) return;
    setUpvoting(true);
    try {
      const res = await apiUpvoteIssue(issue.id);
      onUpdate(issue.id, { upvotes: res.upvotes, upvoted_by_user: res.upvoted });
    } finally { setUpvoting(false); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (commenting || !newComment.trim()) return;
    setCommenting(true);
    try {
      const res = await apiAddComment(issue.id, newComment.trim());
      onUpdate(issue.id, { comments: [...(issue.comments || []), res] });
      setNewComment('');
    } finally { setCommenting(false); }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowDetail(true)}
        className="bg-white p-6 rounded-[36px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative"
      >
        <div className="flex items-start gap-4 mb-4">
           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-gray-400">
              {issue.reported_by_detail?.name?.[0] || 'A'}
           </div>
           <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{issue.reported_by_detail?.name || 'Anonymous'}</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{new Date(issue.reported_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {issue.ward}</p>
           </div>
           <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">
              {issue.category}
           </div>
        </div>

        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-3 line-clamp-2">{issue.title}</h4>

        {issue.image_url && (
          <div className="w-full h-48 rounded-[28px] overflow-hidden border border-slate-50 mb-4 shadow-sm">
             <img src={`${API_BASE}${issue.image_url}`} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-6 pt-1">
           <button
             onClick={handleUpvote}
             disabled={upvoting}
             className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all
               ${issue.upvoted_by_user ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-600'}`}
           >
              <ThumbsUp size={16} fill={issue.upvoted_by_user ? 'currentColor' : 'none'} className={upvoting ? 'animate-bounce' : ''} /> {issue.upvotes || 0}
           </button>
           <button className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-blue-600 transition-all uppercase tracking-widest">
              <MessageCircle size={16} /> {(issue.comments || []).length}
           </button>
           <div className="ml-auto flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${issue.status === 'Resolved' ? 'bg-green-500' : 'bg-blue-600'}`} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{issue.status}</span>
           </div>
        </div>
      </motion.div>

      {/* Detail overlay */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setShowDetail(false)}
          >
             <motion.div
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
               className="w-full max-w-lg bg-white h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[40px] md:rounded-[40px] overflow-hidden shadow-2xl relative"
               onClick={e => e.stopPropagation()}
             >
                <div className="overflow-y-auto h-full p-8 pb-32 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-gray-400 uppercase">{issue.reported_by_detail?.name?.[0] || 'A'}</div>
                         <div><p className="text-xs font-black text-gray-900 leading-none">{issue.reported_by_detail?.name || 'Anonymous'}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{new Date(issue.reported_at).toLocaleString('en-IN')}</p></div>
                      </div>
                      <button onClick={() => setShowDetail(false)} className="p-3 bg-slate-100 rounded-2xl text-gray-900 border border-slate-100 hover:bg-slate-200"><X size={20} strokeWidth={3} /></button>
                   </div>

                   <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-4">{issue.title}</h3>
                      {issue.image_url && <img src={`${API_BASE}${issue.image_url}`} alt="" className="w-full h-64 object-cover rounded-[36px] shadow-xl border-4 border-white mb-4" />}
                      <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{issue.description || 'No description provided.'}"</p>
                   </div>

                   <hr className="border-slate-50" />

                   <div className="space-y-6">
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Live Conversation</h4>
                      <div className="space-y-4">
                         {(issue.comments || []).map(c => (
                           <div key={c.id} className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase flex-shrink-0 border border-blue-100">{c.user_name?.[0] || 'A'}</div>
                              <div className="bg-slate-50 p-4 rounded-3xl rounded-tl-none border border-slate-100 flex-1">
                                 <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight mb-1">{c.user_name}</p>
                                 <p className="text-sm text-gray-600 font-medium leading-relaxed">{c.text}</p>
                              </div>
                           </div>
                         ))}
                         {(issue.comments || []).length === 0 && <p className="text-xs text-gray-400 text-center py-6 font-bold uppercase tracking-widest">Be the first to comment</p>}
                      </div>
                   </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 bg-white/95 backdrop-blur-md border-t border-slate-50 shadow-2xl">
                   <form onSubmit={handleComment} className="flex gap-3">
                      <input
                        type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                        placeholder="Join the local conversation..."
                        className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                      />
                      <button disabled={commenting || !newComment.trim()} type="submit" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                         {commenting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={3} />}
                      </button>
                   </form>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function FeedPage() {
  const [issues, setIssues] = useState([]);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadIssues = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const d = await apiGetPublicIssues();
      setIssues(Array.isArray(d) ? d : []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    loadIssues();
    // Auto-refresh every 15 seconds for live updates
    const interval = setInterval(() => loadIssues(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const updateIssue = (id, updates) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const filtered = issues.filter(i => cat === 'All' || i.category === cat);

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <header className="mb-10 text-center">
         <h2 className="text-3xl font-black text-gray-900 tracking-tight">Public Feed</h2>
         <p className="text-gray-400 font-medium mt-1">Witness real-time city transformation from fellow citizens.</p>
         <button
           onClick={() => loadIssues(true)}
           disabled={refreshing}
           className="mt-4 flex items-center gap-2 mx-auto px-5 py-2 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-100 transition-all"
         >
           <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
           {refreshing ? 'Refreshing...' : 'Refresh Feed'}
         </button>
      </header>

      <div className="flex gap-3 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar">
         {['All', 'Road', 'Water', 'Electricity', 'Garbage', 'Traffic'].map(c => (
           <button
             key={c} onClick={() => setCat(c)}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all h-12 flex items-center justify-center whitespace-nowrap
               ${cat === c ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105' : 'bg-white text-gray-400 border border-slate-100 hover:text-gray-900'}`}
           >{c}</button>
         ))}
      </div>

      <div className="space-y-6">
         {filtered.filter(i => i.is_public).map(issue => (
           <FeedCard key={issue.id} issue={issue} onUpdate={updateIssue} />
         ))}
         {loading && <div className="text-center py-20 animate-pulse text-gray-300 font-black uppercase text-[10px] tracking-widest">Scanning local activity...</div>}
      </div>
    </div>
  );
}
