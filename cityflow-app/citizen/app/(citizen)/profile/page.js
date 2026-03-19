'use client';
import { useCitizen } from '@/lib/CitizenContext';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Phone, Calendar, ShieldCheck, ChevronRight, LogOut, Lock, Activity } from 'lucide-react';
import Link from 'next/link';

const ProfileItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-5 p-6 bg-slate-50 border border-slate-100 rounded-[32px] group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} className={color.replace('bg-', 'text-')} />
     </div>
     <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-base font-bold text-gray-900 truncate">{value || 'Not set'}</p>
     </div>
  </div>
);

export default function ProfilePage() {
  const { user, logout } = useCitizen();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto pb-20">
       <header className="mb-12 text-center">
          <div className="relative inline-block mb-6">
             <div className="w-32 h-32 bg-[#1e3a8a] rounded-[48px] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-blue-200 ring-8 ring-white">
                {user.first_name?.[0]}{user.last_name?.[0]}
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                <ShieldCheck size={20} className="text-white" />
             </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{user.full_name}</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Active Official Citizen • Ichalkaranji</p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileItem icon={Mail} label="Email Address" value={user.email} color="bg-blue-100/50 text-blue-600" />
          <ProfileItem icon={MapPin} label="Home Ward" value={user.ward} color="bg-cyan-100/50 text-cyan-600" />
          <ProfileItem icon={Phone} label="Verified Phone" value={user.phone} color="bg-green-100/50 text-green-600" />
          <ProfileItem icon={Activity} label="Member Since" value={new Date(user.joined_date).toLocaleDateString()} color="bg-purple-100/50 text-purple-600" />
       </div>

       <div className="mt-12 space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest ml-4 mb-4">Account Security</h3>
          <button className="w-full bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 hover:shadow-xl transition-all shadow-sm group">
             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Lock size={18} />
             </div>
             <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-900">Change Security Password</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Last changed 3 months ago</p>
             </div>
             <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="w-full bg-red-50 p-6 rounded-[32px] border border-red-100 flex items-center gap-4 hover:bg-red-600 hover:text-white transition-all group shadow-sm text-red-600"
          >
             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors shadow-sm">
                <LogOut size={18} />
             </div>
             <p className="text-sm font-black uppercase tracking-widest flex-1 text-left">Terminate Active Session</p>
          </button>
       </div>

       <div className="mt-12 text-center px-10">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
             This account is linked to the Ichalkaranji Smart City database for official communication and issue reporting.
          </p>
       </div>
    </div>
  );
}
