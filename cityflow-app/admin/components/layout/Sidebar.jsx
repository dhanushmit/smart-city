'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, AlertCircle, Trash2, BarChart2,
  Users, Map, Globe2, Settings, X, Radio, User
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/issues', icon: AlertCircle, label: 'All Issues' },
  { to: '/garbage', icon: Trash2, label: 'Garbage Monitoring' },
  { to: '/workers', icon: Users, label: 'Workers' },
  { to: '/citizens', icon: User, label: 'Citizens' },
  { to: '/wards', icon: Map, label: 'Wards' },
  { to: '/feed', icon: Radio, label: 'Civic Feed' },
  { to: '/map', icon: Globe2, label: 'Issue Map' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#1e3a8a] text-white z-40 flex flex-col
        transform transition-all duration-300 ease-in-out lg:relative
        ${open ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:translate-x-0 lg:-ml-64'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-700">
          <div>
            <h1 className="text-xl font-bold tracking-tight">CityFlow</h1>
            <p className="text-blue-300 text-xs mt-0.5">Admin Dashboard</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-blue-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-blue-700">
          <p className="text-blue-400 text-xs">Tamilnadu Government</p>
          <p className="text-blue-500 text-xs">v2.0 · Next.js + Node.js</p>
        </div>
      </aside>
    </>
  );
}
