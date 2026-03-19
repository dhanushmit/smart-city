'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, AlertCircle, Trash2, Radio, User, LogOut, X, Shield } from 'lucide-react';
import { useCitizen } from '@/lib/CitizenContext';

const citizenItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/feed', icon: Radio, label: 'Civic Feed' },
  { to: '/issues', icon: AlertCircle, label: 'My Issues' },
  { to: '/bins', icon: Trash2, label: 'Garbage bins' },
  { to: '/profile', icon: User, label: 'Account' },
];

const workerItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Task Console' },
  { to: '/feed', icon: Radio, label: 'Public Feed' },
  { to: '/profile', icon: User, label: 'Account' },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useCitizen();
  const router = useRouter();

  const handleLogout = () => { logout(); router.replace('/login'); };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-[60] lg:hidden backdrop-blur-sm" onClick={onClose} />}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white z-[70] flex flex-col border-r border-slate-100
        transform transition-all duration-500 ease-in-out lg:relative
        ${open ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:translate-x-0 lg:-ml-72'}
      `}>
        <div className="p-8 border-b border-slate-50">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Shield size={22} className="text-white" />
             </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">CityFlow</h1>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                  {user?.role === 'worker' ? 'Field Workforce' : 'Citizen Portal'}
                </p>
              </div>
          </Link>
          <button onClick={onClose} className="lg:hidden absolute top-8 right-6 text-gray-400 hover:text-gray-900"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {(user?.role === 'worker' ? workerItems : citizenItems).map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} href={to} onClick={onClose} className={`
                flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all
                ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-gray-500 hover:bg-slate-50 hover:text-gray-900'}
              `}>
                <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
           <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-[#1e3a8a] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.full_name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{user?.ward}</p>
                 </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[20px] text-[10px] font-bold text-red-500 hover:bg-red-50 hover:border-red-100 transition-all uppercase tracking-widest">
                 <LogOut size={14} /> Sign Out
              </button>
           </div>
        </div>
      </aside>
    </>
  );
}
