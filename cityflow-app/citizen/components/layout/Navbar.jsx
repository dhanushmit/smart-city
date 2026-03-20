'use client';
import { useState } from 'react';
import { useCitizen } from '@/lib/CitizenContext';
import { Menu, User, Bell, Shield } from 'lucide-react';

export default function Navbar({ onOpenSidebar }) {
  const { user, logout } = useCitizen();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Mock initial citizen notifications to make the tray look lively and interactive
  const unreadCount = 2;
  const notifications = [
    { id: 2, title: 'Issue Resolved', text: 'Pothole on Main St has been patched and verified.', type: 'success' },
    { id: 1, title: 'Welcome to CityFlow', text: 'Your account is verified. Start reporting issues to help your city!', type: 'info' }
  ];

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-[50]">
      <button onClick={onOpenSidebar} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-gray-500 transition-colors">
        <Menu size={22} />
      </button>

      <div className="lg:hidden flex items-center gap-2 ml-4">
         <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Shield size={16} className="text-white" />
         </div>
         <span className="font-bold text-gray-900 text-sm">CityFlow</span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 relative">
         
         <div className="relative">
           <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }} className="relative p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-gray-500 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-100 animate-pulse" />}
           </button>
           
           {showNotifs && (
             <div className="absolute right-0 sm:right-0 top-full mt-3 w-[calc(100vw-48px)] sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 animate-fadeIn overflow-hidden z-[100] transform -translate-x-0">
               <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{unreadCount} New</span>
               </div>
               <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                       <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 mb-1">{n.title}</p>
                       <p className="text-xs text-gray-500 leading-relaxed">{n.text}</p>
                    </div>
                  ))}
               </div>
             </div>
           )}
         </div>

         <div className="relative">
           <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }} className="flex items-center gap-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 transition-colors cursor-pointer px-4 py-2.5 rounded-[20px] border border-slate-100">
              <div className="text-right hidden md:block">
                 <p className="text-sm font-bold text-gray-900 leading-none">{user?.first_name} {user?.last_name}</p>
                 <p className="text-[10px] text-gray-400 font-bold tracking-tight mt-1">{user?.ward}</p>
              </div>
              <div className="w-10 h-10 bg-[#1e3a8a] rounded-full flex items-center justify-center text-white font-bold text-xs ring-4 ring-white shadow-sm">
                 {user?.first_name?.[0] || ''}{user?.last_name?.[0] || 'C'}
              </div>
           </button>
           
           {showProfile && (
             <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 animate-fadeIn overflow-hidden">
               <div className="p-4 border-b border-gray-100 bg-slate-50/50">
                 <p className="text-sm font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                 <p className="text-xs text-gray-500 font-medium truncate">{user?.email}</p>
               </div>
               <button onClick={logout} className="w-full text-left px-5 py-4 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                  Sign Out
               </button>
             </div>
           )}
         </div>

      </div>

      {(showNotifs || showProfile) && (
         <div className="fixed inset-0 z-[-1]" onClick={() => { setShowNotifs(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
