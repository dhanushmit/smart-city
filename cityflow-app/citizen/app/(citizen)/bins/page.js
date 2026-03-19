'use client';
import { useState, useEffect } from 'react';
import { apiGetBins } from '@/lib/api';
import { motion } from 'framer-motion';
import { Trash2, MapPin, Activity, ShieldAlert, AlertCircle } from 'lucide-react';

const BinCard = ({ bin, idx }) => {
  const level = bin.fill_level || 0;
  const isOverflow = level >= 90;
  const isWarning = level >= 70 && level < 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`bg-white p-6 rounded-[36px] border border-slate-50 shadow-sm relative overflow-hidden group
        ${isOverflow ? 'ring-2 ring-red-500 shadow-xl shadow-red-50' : ''}`}
    >
       <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
             <Trash2 size={24} className={isOverflow ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-blue-500'} />
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{bin.bin_id}</p>
             <p className="text-sm font-black text-gray-900 mt-1">{bin.ward}</p>
          </div>
       </div>

       <div className="space-y-4">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sanitation Status</span>
             <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1
                ${isOverflow ? 'text-red-500' : isWarning ? 'text-orange-400' : 'text-green-500'}`}>
                {isOverflow ? <ShieldAlert size={10} /> : null} {isOverflow ? 'Overflow' : isWarning ? 'Near Capacity' : 'Normal'}
             </span>
          </div>

          <div className="relative h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
             <motion.div
               initial={{ width: 0 }}
               animate={{ width: `${level}%` }}
               transition={{ duration: 1, delay: 0.3 }}
               className={`h-full rounded-full transition-all
                  ${isOverflow ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-green-500'}`}
             />
          </div>

          <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest pt-1">
             <span>{level}% Filled</span>
             <span>Last Empty: {new Date(bin.last_collected).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
          </div>
       </div>

       <div className="mt-6 flex items-center gap-2 p-3 bg-slate-50 rounded-2xl text-[10px] font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{bin.location_text}</span>
       </div>
    </motion.div>
  );
};

export default function BinsPage() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetBins().then(d => { setBins(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <header className="mb-10 text-center md:text-left">
         <h2 className="text-3xl font-black text-gray-900 tracking-tight">Smart Sanitation</h2>
         <p className="text-gray-400 font-medium mt-1">Real-time occupancy tracking for smart garbage bins in Ichalkaranji.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {bins.map((bin, idx) => (
           <BinCard key={bin.id} bin={bin} idx={idx} />
         ))}
         {loading && <div className="col-span-full py-20 text-center opacity-40 uppercase font-black text-[10px] tracking-[0.3em] animate-pulse">Requesting Bin sensor data...</div>}
         {!loading && bins.length === 0 && (
           <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
              <AlertCircle size={48} className="text-slate-200 mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No sensors found in your area</p>
           </div>
         )}
      </div>
    </div>
  );
}
