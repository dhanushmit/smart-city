'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertCircle, Trash2, Radio, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/feed', icon: Radio, label: 'Feed' },
  { to: '/report', icon: Plus, label: 'Report', primary: true },
  { to: '/issues', icon: AlertCircle, label: 'Issues' },
  { to: '/profile', icon: User, label: 'Me' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[100] lg:hidden">
       <div className="mx-6 mb-8 p-3 glass-pill flex items-center justify-between shadow-2xl shadow-blue-200">
          {items.map(({ to, icon: Icon, label, primary }) => {
            const active = pathname === to;
            if (primary) return (
              <Link key={to} href={to} className="relative -top-4">
                 <motion.div
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 border-4 border-white"
                 >
                    <Icon size={28} />
                 </motion.div>
              </Link>
            );
            return (
              <Link key={to} href={to} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600' : 'text-gray-400 focus:text-gray-900 group-hover:text-blue-600'}`}>
                 <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-blue-50' : 'bg-transparent'}`}>
                    <Icon size={22} className="transition-all" />
                 </div>
                 {/* <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span> */}
              </Link>
            );
          })}
       </div>
    </nav>
  );
}
