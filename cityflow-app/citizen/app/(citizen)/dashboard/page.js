'use client';
import { useState, useEffect } from 'react';
import { useCitizen } from '@/lib/CitizenContext';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGetPublicIssues, apiGetMyIssues, apiGetWorkerTasks } from '@/lib/api';
import { Send, CheckCircle2, AlertCircle, Clock, ChevronRight, MapPin, ThumbsUp, MessageCircle, Plus, Briefcase, Loader2, Zap, Target, Bell, Shield } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smart-city-qc23.onrender.com';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.6, type: 'spring', damping: 15 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white/80 backdrop-blur-3xl p-5 rounded-[32px] border border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group flex flex-col items-center text-center"
  >
    <div className={`absolute top-0 right-0 w-20 h-20 blur-2xl opacity-10 rounded-full -mr-8 -mt-8 ${color}`} />
    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center mb-4 ${color} bg-opacity-10 group-hover:rotate-6 transition-all duration-500`}>
      <Icon size={26} className={color.replace('bg-', 'text-')} />
    </div>
    <div className="space-y-0.5">
      <p className="text-3xl font-black text-gray-900 leading-none tabular-nums tracking-tighter">{value}</p>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em]">{label}</p>
    </div>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, href, color }) => (
  <Link href={href} className="flex flex-col items-center gap-2 group">
    <motion.div 
      whileTap={{ scale: 0.85 }}
      className={`w-16 h-16 rounded-[24px] ${color} shadow-lg flex items-center justify-center text-white ring-4 ring-white transition-all group-hover:shadow-2xl`}
    >
      <Icon size={24} strokeWidth={2.5} />
    </motion.div>
    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
  </Link>
);

export default function CitizenDashboard() {
  const { user } = useCitizen();
  const [publicIssues, setPublicIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [workerTasks, setWorkerTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [pub, my] = await Promise.all([apiGetPublicIssues(), apiGetMyIssues()]);
      setPublicIssues(Array.isArray(pub) ? pub : []);
      setMyIssues(Array.isArray(my) ? my : []);
      if (user?.role === 'worker') {
        const tasks = await apiGetWorkerTasks(user.id);
        setWorkerTasks(Array.isArray(tasks) ? tasks : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, [user]);

  const isWorker = user?.role === 'worker';
  const stats = !isWorker ? [
    { icon: Send, label: 'Reports', value: myIssues.length, color: 'bg-blue-600' },
    { icon: Clock, label: 'Pending', value: myIssues.filter(i => i.status !== 'Resolved').length, color: 'bg-amber-500' },
    { icon: CheckCircle2, label: 'Fixed', value: myIssues.filter(i => i.status === 'Resolved').length, color: 'bg-emerald-500' },
    { icon: Target, label: 'Score', value: myIssues.length * 10, color: 'bg-indigo-600' },
  ] : [
    { icon: Briefcase, label: 'Tasks', value: workerTasks.length, color: 'bg-blue-600' },
    { icon: Zap, label: 'Active', value: workerTasks.filter(t => t.status === 'In Progress').length, color: 'bg-amber-500' },
    { icon: CheckCircle2, label: 'Closed', value: workerTasks.filter(t => t.status === 'Resolved').length, color: 'bg-emerald-500' },
    { icon: AlertCircle, label: 'Issues', value: publicIssues.filter(i => i.ward === user?.ward).length, color: 'bg-rose-500' },
  ];

  if (loading && !publicIssues.length) return (
     <div className="min-h-screen flex flex-col items-center justify-center p-10 gap-6">
        <div className="relative">
           <div className="w-20 h-20 border-8 border-slate-100 rounded-full" />
           <div className="absolute inset-0 w-20 h-20 border-t-8 border-blue-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm font-black text-blue-600 uppercase tracking-widest animate-pulse">Establishing Connection</p>
     </div>
  );

  return (
    <div className="pb-32 pt-2 px-1 max-w-lg mx-auto overflow-hidden">
      {/* Dynamic App Header */}
      <section className="px-5 mb-8 flex items-center justify-between">
        <div>
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <Zap size={12} className="fill-blue-600" /> System Active
           </p>
           <h2 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none">
             Hello, {user?.first_name}
           </h2>
        </div>
        <div className="flex gap-2">
           <button className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
              <Bell size={20} />
           </button>
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
              {user?.first_name?.[0]}
           </div>
        </div>
      </section>

      {/* Hero Stats Card */}
      <section className="px-5 mb-10 overflow-visible">
         <motion.div 
           initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
           className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[40px] p-8 text-white relative shadow-2xl shadow-indigo-200 overflow-hidden"
         >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex justify-between items-center mb-8">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 opacity-80 mb-2">My Ward Impact</p>
                  <p className="text-4xl font-[900] tracking-tighter leading-none">{user?.ward}</p>
               </div>
               <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <Shield size={28} className="text-white fill-white/10" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[9px] font-black uppercase text-indigo-100/60 tracking-widest leading-none mb-1 text-center">Active Issues</p>
                  <p className="text-2xl font-black text-white text-center">{publicIssues.filter(i => i.ward === user?.ward && i.status !== 'Resolved').length}</p>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[9px] font-black uppercase text-indigo-100/60 tracking-widest leading-none mb-1 text-center">Score Contribution</p>
                  <p className="text-2xl font-black text-white text-center">980</p>
               </div>
            </div>
         </motion.div>
      </section>

      {/* Quick Actions Hub */}
      <section className="px-5 mb-10">
         <div className="bg-slate-50/50 rounded-[36px] p-6 border border-slate-100 flex justify-between items-center shadow-inner">
            <QuickAction icon={Plus} label="Report" href="/report" color="bg-blue-600" />
            <QuickAction icon={Target} label="Wards" href="/feed" color="bg-indigo-600" />
            <QuickAction icon={MapPin} label="Live Map" href="/feed" color="bg-emerald-600" />
            <QuickAction icon={MessageCircle} label="Civic Hub" href="/feed" color="bg-rose-600" />
         </div>
      </section>

      {/* Activity Sections */}
      <section className="px-5 space-y-8">
         <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
               <span className="w-1.5 h-10 bg-blue-600 rounded-full" /> {isWorker ? 'Assigned' : 'Recent'} Reports
            </h3>
            <Link href={isWorker ? "/tasks" : "/issues"} className="text-[10px] font-black bg-slate-100 px-4 py-2 rounded-full uppercase tracking-widest text-gray-400">View All</Link>
         </div>

         <div className="space-y-4">
            {(isWorker ? workerTasks : myIssues).slice(0, 3).map((issue, idx) => (
              <motion.div
                key={issue.id}
                initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-5 rounded-[40px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex items-center gap-6 group active:scale-95 transition-all"
              >
                 <div className="w-24 h-24 rounded-[30px] bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-xl relative">
                    {issue.image_url ? (
                      <img src={`${API_BASE}${issue.image_url}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                         <AlertCircle size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                          ${issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            issue.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                            'bg-blue-50 text-blue-600 border border-blue-100'}`}
                       >
                          {issue.status}
                       </span>
                    </div>
                    <h4 className="text-lg font-[900] text-gray-900 truncate tracking-tight">{issue.title}</h4>
                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-1"><MapPin size={10} className="text-blue-500" /> {issue.ward}</p>
                    
                    <div className="mt-4 flex items-center gap-3">
                       <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: issue.status === 'Resolved' ? '100%' : issue.status === 'In Progress' ? '60%' : '20%' }}
                            className={`h-full rounded-full ${issue.status === 'Resolved' ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                          />
                       </div>
                       <ChevronRight size={16} className="text-slate-200" />
                    </div>
                 </div>
              </motion.div>
            ))}

            <AnimatePresence>
               {!(isWorker ? workerTasks : myIssues).length && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                       <Shield size={32} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Active Reports</p>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </section>
    </div>
  );
}
