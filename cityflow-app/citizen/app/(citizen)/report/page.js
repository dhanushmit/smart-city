'use client';
import { useState } from 'react';
import { apiReportIssue, apiDetectIssue } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Send, Loader2, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'Road', icon: '🛣️', color: 'bg-blue-100/50 text-blue-600', desc: 'Potholes, broken roads, or speed breakers' },
  { id: 'Water', icon: '💧', color: 'bg-cyan-100/50 text-cyan-600', desc: 'Leaking pipes, water scarcity, or quality' },
  { id: 'Electricity', icon: '⚡', color: 'bg-yellow-100/50 text-yellow-600', desc: 'Streetlights, power fluctuations, or outages' },
  { id: 'Garbage', icon: '🗑️', color: 'bg-green-100/50 text-green-600', desc: 'Overfilled bins, littering, or smell' },
  { id: 'Traffic', icon: '🚦', color: 'bg-red-100/50 text-red-600', desc: 'Illegal parking, signals, or congestion' },
  { id: 'Public Facilities', icon: '🏛️', color: 'bg-purple-100/50 text-purple-600', desc: 'Park issues, public toilets, or benches' },
];

const WARDS = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Road', ward: 'Ward 1', location_text: '', is_public: true, location_lat: null, location_lng: null });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [aiConfidence, setAiConfidence] = useState(null);

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImage(file);
    setPreview(URL.createObjectURL(file));

    // Capture GPS Geolocation instantly (Mandatory constraint)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm(p => ({ ...p, location_lat: pos.coords.latitude, location_lng: pos.coords.longitude })),
        (err) => { 
          console.log('GPS Error:', err); 
          setError('GPS Location is mandatory to verify complaint authenticity. Please enable browser location permissions and try taking a photo again.'); 
        }, 
        { enableHighAccuracy: true }
      );
    } else {
      setError('Your browser does not support GPS location, which is required.');
    }

    // Process AI Autodetection automatically via Gemini
    try {
      setAiLoading(true);
      const fd = new FormData();
      fd.append('image', file);
      const aiData = await apiDetectIssue(fd);
      
      setForm(p => ({
        ...p,
        category: aiData.category || p.category,
        title: aiData.title || p.title,
        description: aiData.description || p.description,
      }));
      setAiConfidence(aiData.confidence);
    } catch (err) {
      console.log('AI Auto-detect failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null) fd.append(k, String(v)); });
      if (image) fd.append('image', image);

      await apiReportIssue(fd);
      setSuccess(true);
      setTimeout(() => router.replace('/dashboard'), 2500);
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-100 animate-bounce">
           <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Report Submitted Successfully! 🙌</h2>
        <p className="text-gray-400 font-medium max-w-sm mb-12">Thank you for helping Ichalkaranji grow. Our team has been notified and we'll keep you updated.</p>
        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
           <div className="h-full bg-blue-600 rounded-full animate-progress" />
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase mt-4 tracking-widest">Redirecting you to dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Report a Problem</h2>
        <p className="text-gray-400 font-medium mt-1">Submit your concern with a photo and location for rapid action.</p>
      </header>

      {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-5 rounded-3xl mb-8 flex items-center gap-3"><AlertCircle size={20} /> {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
         {/* Step 1: Category Selection */}
         <section className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
               <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] text-white">1</span> Select Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {CATEGORIES.map(cat => (
                 <button
                   key={cat.id} type="button"
                   onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                   className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-start gap-3 group
                     ${form.category === cat.id ? 'border-blue-600 bg-blue-50/50 scale-[1.05] shadow-xl shadow-blue-100' : 'border-slate-50 bg-white hover:border-blue-100'}`}
                 >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${cat.color}`}>{cat.icon}</div>
                    <div className="text-left font-bold text-gray-900 leading-tight">
                       <p className="text-sm">{cat.id}</p>
                       {/* <p className="text-[10px] text-gray-400 font-medium mt-1 line-clamp-1">{cat.desc}</p> */}
                    </div>
                 </button>
               ))}
            </div>
         </section>

         {/* Step 2: Photo Evidence */}
         <section className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
               <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] text-white">2</span> Attach Evidence
            </h3>
            <div className="relative group">
              {preview ? (
                <div className="w-full h-80 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative">
                   <img src={preview} alt="" className="w-full h-full object-cover" />
                   <button onClick={() => { setPreview(null); setImage(null); setAiConfidence(null); }} className="absolute top-6 right-6 p-4 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-100 border-2 border-white hover:scale-110 transition-transform z-20"><X size={20} strokeWidth={3} /></button>
                   
                   {/* AI Auto-Detect Overlay */}
                   <AnimatePresence>
                     {aiLoading && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                         <Loader2 size={40} className="text-blue-400 animate-spin mb-4" />
                         <p className="text-white font-black tracking-widest uppercase text-sm animate-pulse">Gemini AI Analyzing...</p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                   {!aiLoading && aiConfidence && (
                     <div className="absolute bottom-6 left-6 right-20 bg-emerald-500/90 backdrop-blur-md rounded-2xl p-4 border-2 border-emerald-400 shadow-xl z-10 animate-slideUp">
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 flex justify-between">
                         <span><CheckCircle2 size={12} className="inline mr-1 mb-0.5" /> Gemini Verified</span>
                         <span className="bg-white/20 px-2 py-0.5 rounded-full">{aiConfidence}% Match</span>
                       </p>
                       <p className="text-white font-bold text-sm mt-1 leading-snug">Auto-filled problem details based on visual evidence.</p>
                     </div>
                   )}
                   {form.location_lat && (
                     <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-xl z-10 flex flex-col items-center">
                       <p className="text-[8px] font-black uppercase tracking-widest text-blue-200 mb-1 flex items-center gap-1"><MapPin size={10} /> GPS Geo-Tag</p>
                       <p className="text-white font-mono text-xs font-bold leading-tight">{form.location_lat.toFixed(6)}</p>
                       <p className="text-white font-mono text-xs font-bold leading-tight">{form.location_lng.toFixed(6)}</p>
                     </div>
                   )}
                </div>
              ) : (
                <label className="w-full h-64 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-50/50 hover:border-blue-400 group overflow-hidden relative">
                   <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
                   <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={28} className="text-blue-600" />
                   </div>
                   <p className="text-gray-900 font-black text-lg">Click to Snap a Photo</p>
                   <p className="text-gray-400 text-sm font-medium mt-1">Max file size: 10MB</p>
                </label>
              )}
            </div>
         </section>

         {/* Step 3: Details */}
         <section className="space-y-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
               <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] text-white">3</span> Information Details
            </h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Subject Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Pothole in middle of road" required
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-sm" />
               </div>
               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Describe the Problem</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe exactly what needs fixing..." rows={4}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-sm resize-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Ward Location</label>
                    <select value={form.ward} onChange={e => setForm(p => ({ ...p, ward: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all appearance-none shadow-sm">
                      {WARDS.map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Landmark/Street</label>
                    <input type="text" value={form.location_text} onChange={e => setForm(p => ({ ...p, location_text: e.target.value }))} placeholder="Near City Mall"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-sm" />
                  </div>
               </div>
               <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 flex items-start gap-3">
                  <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Make issue public?</p>
                     <p className="text-[10px] text-blue-400 font-medium leading-relaxed">Other citizens in your ward can see and upvote this report. This helps the corporation prioritize the issue. No personal data will be shared.</p>
                     <div className="flex gap-4 mt-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="radio" checked={form.is_public} onChange={() => setForm(p=>({...p, is_public: true}))} className="hidden" />
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.is_public ? 'border-blue-600 bg-blue-600' : 'border-blue-200'}`}>
                              {form.is_public && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                           </div>
                           <span className={`text-[10px] font-black uppercase ${form.is_public ? 'text-blue-600' : 'text-blue-300'}`}>Yes, Public</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="radio" checked={!form.is_public} onChange={() => setForm(p=>({...p, is_public: false}))} className="hidden" />
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!form.is_public ? 'border-blue-600 bg-blue-600' : 'border-blue-200'}`}>
                              {!form.is_public && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                           </div>
                           <span className={`text-[10px] font-black uppercase ${!form.is_public ? 'text-blue-600' : 'text-blue-300'}`}>No, Private</span>
                        </label>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <button
           type="submit"
           disabled={loading || !form.title || !form.location_lat}
           className="w-full btn-primary disabled:opacity-60 flex items-center justify-center gap-3 py-6 shadow-2xl !rounded-[32px] text-lg font-black tracking-tight mt-8"
         >
           {loading ? <><Loader2 size={24} className="animate-spin" /> Submitting Report...</> : <><Send size={24} strokeWidth={3} /> Submit Concern</>}
           {!form.location_lat && !loading && <span className="absolute bottom-2 text-[10px] text-red-200">Requires GPS Location to submit</span>}
         </button>
      </form>
    </div>
  );
}
