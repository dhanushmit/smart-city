'use client';
import { useState, useEffect } from 'react';
import { useCitizen } from '@/lib/CitizenContext';
import { motion } from 'framer-motion';
import { apiGetPublicIssues, apiGetMyIssues, apiGetWorkerTasks } from '@/lib/api';
import { Send, CheckCircle2, AlertCircle, Clock, ChevronRight, MapPin, ThumbsUp, MessageCircle, Plus, Briefcase, Loader2 } from 'lucide-react';
import Link from 'next/link';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-10 -mt-10 ${color}`} />
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <p className="text-3xl font-black text-gray-900 leading-none tabular-nums tracking-tight">{value}</p>
    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-2">{label}</p>
  </motion.div>
);

export default function CitizenDashboard() {
  const { user } = useCitizen();
  const [publicIssues, setPublicIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [workerTasks, setWorkerTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
          setLoading(false);
       }
    };
    fetchData();
  }, [user]);

  const isWorker = user?.role === 'worker';

  const stats = isWorker ? [
    { icon: Briefcase, label: 'Assigned', value: workerTasks.length, color: 'bg-blue-600', delay: 0.1 },
    { icon: Clock, label: 'In Progress', value: workerTasks.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length, color: 'bg-orange-500', delay: 0.2 },
    { icon: CheckCircle2, label: 'Resolved', value: workerTasks.filter(i => i.status === 'Resolved').length, color: 'bg-green-600', delay: 0.3 },
    { icon: AlertCircle, label: 'Ward Load', value: publicIssues.filter(i => i.ward === user?.ward && i.status !== 'Resolved').length, color: 'bg-red-500', delay: 0.4 },
  ] : [
    { icon: Send, label: 'Reported', value: myIssues.length, color: 'bg-blue-600', delay: 0.1 },
    { icon: Clock, label: 'Pending', value: myIssues.filter(i => i.status !== 'Resolved').length, color: 'bg-orange-500', delay: 0.2 },
    { icon: CheckCircle2, label: 'Resolved', value: myIssues.filter(i => i.status === 'Resolved').length, color: 'bg-green-600', delay: 0.3 },
    { icon: AlertCircle, label: 'Ward Issues', value: publicIssues.filter(i => i.ward === user?.ward).length, color: 'bg-red-500', delay: 0.4 },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
           <h2 className="text-4xl font-[900] text-gray-900 tracking-tight leading-tight">
             Welcome, <span className="text-blue-600">{user?.first_name}</span> 👋
           </h2>
           <p className="text-gray-400 font-semibold mt-2 text-sm flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             City Pulse: <span className="text-gray-600">All systems operational in {user?.ward}</span>
           </p>
        </motion.div>
        <div className="flex gap-3">
           {!isWorker ? (
             <Link href="/report" className="flex-1 md:flex-none py-4 px-8 btn-primary !rounded-[24px] shadow-blue-100 flex items-center justify-center gap-3">
                <Plus size={20} strokeWidth={3} /> <span className="font-bold">Report New Issue</span>
             </Link>
           ) : (
             <div className="bg-orange-50 text-orange-600 px-6 py-4 rounded-2xl flex items-center gap-2 border border-orange-100">
               <Briefcase size={20} /> <span className="font-bold">Active Workforce</span>
             </div>
           )}
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </section>

      {/* Main Content: My Recent vs Ward Feed */}
      <div className="grid lg:grid-cols-3 gap-10">
         {/* Left col: My recent issues */}
         <section className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                 {isWorker ? 'Assigned Operations' : 'Recent Reports'}
               </h3>
               {(!isWorker ? myIssues.length : workerTasks.length) > 3 && (
                 <Link href={isWorker ? "/tasks" : "/issues"} className="group text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-2 uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-full transition-all">
                   View Workspace <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
               )}
            </div>
            <div className="space-y-5">
               {(isWorker ? workerTasks : myIssues).slice(0, 3).map((issue, idx) => (
                 <motion.div
                   key={issue.id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 + (0.1 * idx), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                   className="glass-card hover:border-blue-200 transition-all !p-5 relative overflow-hidden"
                 >
                    <div className="flex items-start gap-6">
                       <div className="w-24 h-24 rounded-[24px] bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-inner group">
                          {issue.image_url ? (
                            <img src={`http://localhost:5000${issue.image_url}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                               <AlertCircle size={32} />
                            </div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">{issue.display_id}</span>
                             <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${issue.status === 'Resolved' ? 'bg-green-500' : issue.status === 'In Progress' ? 'bg-yellow-500' : 'bg-blue-300'}`} />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{issue.status}</span>
                             </div>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 truncate leading-tight mb-1">{issue.title}</h4>
                          <div className="flex items-center gap-4">
                             <p className="text-xs text-gray-400 font-bold flex items-center gap-1 uppercase tracking-wider"><MapPin size={12} className="text-blue-500" /> {issue.ward}</p>
                             <p className="text-xs text-gray-400 font-bold flex items-center gap-1 uppercase tracking-wider"><Clock size={12} className="text-orange-500" /> {new Date(issue.reported_at).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-4 w-full bg-slate-100/50 rounded-full h-2 overflow-hidden border border-slate-50">
                             <div className={`h-full rounded-full transition-all duration-1000
                                ${issue.status === 'Resolved' ? 'w-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                                  issue.status === 'In Progress' ? 'w-2/3 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' :
                                  issue.status === 'Assigned' ? 'w-1/3 bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'w-1/12 bg-slate-300'}`}
                             />
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ))}
               {loading && <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={32} className="text-blue-600 animate-spin" />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Synchronizing Data</p>
               </div>}
               {!loading && (isWorker ? workerTasks : myIssues).length === 0 && (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   className="bg-slate-50 border-4 border-dotted border-slate-200 rounded-[40px] p-16 text-center"
                 >
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                       <Send size={40} className="text-blue-200" />
                    </div>
                    <p className="text-gray-900 font-black text-2xl tracking-tight">
                      {isWorker ? 'All Clear!' : 'No Reports Yet'}
                    </p>
                    <p className="text-gray-400 font-semibold mt-2 mb-10 max-w-xs mx-auto text-sm">
                      {isWorker ? 'Great job! Your assignment queue is currently empty. Stay alert for updates.' : 'Be the change Ichalkaranji needs. Start reporting issues in your local area.'}
                    </p>
                    {!isWorker && <Link href="/report" className="btn-primary !py-5 !px-10">Report First Issue</Link>}
                 </motion.div>
               )}
            </div>
         </section>

         {/* Right col: Public feed */}
         <section className="space-y-6">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
            <div className="space-y-4">
              {publicIssues.filter(i => i.is_public).slice(0, 5).map(issue => (
                <div key={issue.id} className="bg-white p-5 rounded-[28px] border border-slate-50 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-2 h-full group-hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                            {issue.reported_by_detail?.name?.[0] || 'A'}
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{issue.reported_by_detail?.name || 'Anonymous'}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{new Date(issue.reported_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase bg-slate-50 px-2 py-0.5 rounded-full">{issue.category}</span>
                   </div>
                   <h5 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{issue.title}</h5>
                   <div className="flex items-center gap-4 pt-3 border-t border-slate-50">
                      <button className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest focus:text-blue-600">
                         <ThumbsUp size={12} /> {issue.upvotes || 0}
                      </button>
                      <button className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                         <MessageCircle size={12} /> {(issue.comments || []).length}
                      </button>
                   </div>
                </div>
              ))}
              <Link href="/feed" className="block w-full py-4 text-center border-2 border-slate-100 rounded-3xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-colors">
                 Discover Public Issues Feed
              </Link>
            </div>
         </section>
      </div>
    </div>
  );
}
